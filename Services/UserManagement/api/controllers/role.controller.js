const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const {
  GeneralResponse
} = require('../../../../CommonLibrary/api/utils/response');
const { BadRequest } = require('../../../../CommonLibrary/api/utils/error');
const httpStatusCode = require('../../../../CommonLibrary/api/utils/httpStatusCode');
const messages = require('../constants/message');
const commonMessages = require('../../../../CommonLibrary/api/constants/message');
const {
  getDateUTC
} = require('../../../../CommonLibrary/api/helpers/datetime.helper');
const {
  catchAsync
} = require('../../../../CommonLibrary/api/helpers/error.helper');
const { STATUS } = require('../../../../CommonLibrary/api/constants/enums');

const getExecutionPath = methodName => `${__filename}\\${methodName}`;

const getPermission = async (moduleData, roleId) => {
  const permissionList = roleId !== 0
      ? await prisma.$queryRaw`SELECT DISTINCT
      RP.PermissionId as id,
      RP.Permission as isDefault,
      PM.Name as 'name',
      CONCAT(PM.DisplayName,' ',${moduleData.Name}) as displayName,
      PM.Description as 'description'
      FROM RolePermission as RP
      LEFT JOIN PermissionMaster as PM ON PM.Id = RP.PermissionId
      WHERE RP.RoleId = ${roleId} AND RP.ModuleId = ${moduleData.Id}`
      : await prisma.$queryRaw`SELECT DISTINCT
      MP.PermissionId as id, 
      MP.IsDefaultTrue as isDefault,
      PM.Name as 'name',
      CONCAT(PM.DisplayName,' ',${moduleData.Name}) as displayName,
      PM.Description as 'description'
      FROM ModulePermission as MP
      LEFT JOIN PermissionMaster as PM ON PM.Id = MP.PermissionId
      WHERE MP.ModuleId =  ${moduleData.Id} AND MP.IsActive = 'true'`;

  return permissionList.length > 0 ? permissionList : null;
};

const getModuleWisePermission = async (parentId, roleId) => {
  let moduleList = [];
  const modules = await prisma.ModuleMaster.findMany({
    where: {
      ParentId: parentId
    }
  });

  moduleList = await Promise.all(
    modules?.map(async item => {
      const moduleDetails = {
        moduleId    : item.Id,
        name        : item.Name,
        displayName : item.DisplayName,
        parentId    : item.ParentId,
        isRestrict  : false,
        permissions : await getPermission(item, roleId),
        childs      : await getModuleWisePermission(item.Id, roleId)
      };
      return moduleDetails;
    })
  );

  return moduleList.length > 0 ? moduleList : null;
};
const getSortBy = async sortColumn => {
  let sortby = '';
  if (sortColumn === 'name') {
    sortby = 'Name';
  } else if (sortColumn === 'description') {
    sortby = 'Description';
  } else if (sortColumn === 'status') {
    sortby = 'IsActive';
  } else {
    sortby = 'CreateDate';
  }
  return sortby;
};

const checkIfUserWithRoleExist = async (roleid, roleDetail, next) => {
  if (roleDetail.isActive === false) {
    const userWithRole = await prisma.User.count({
      where: { RoleId: roleid }
    });

    if (userWithRole > 0) {
      const ERR_MESSAGE = userWithRole > 1
          ? messages.CANNOT_INACTIVATE_ROLE.replace(/<n>/, userWithRole)
          : messages.CANNOT_INACTIVATE_ROLE.replace(
              /<n>/,
              userWithRole
          ).replace(/employees/, 'employee');

      return next(new BadRequest(ERR_MESSAGE));
    }
  }
  return roleid;
};
module.exports = {
  getRoleDetailByRoleId: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('getRoleDetailByRoleId'));
    const roleId = parseInt(req?.query?.roleId, 10);
    let roleDetail = {};
    let permission = {};
    if (roleId === 0) {
      roleDetail = {
        roleId      : 0,
        roleName    : '',
        description : '',
        status      : STATUS.ACTIVE,
        isActive    : true,
        userId      : 0
      };
      permission = await getModuleWisePermission(0, roleId);
    } else {
      const role = await prisma.RoleMaster.findUnique({
        where: { Id: roleId }
      });

      if (!role) {
        return next(new BadRequest(messages.ROLE_NOT_EXIST));
      }
      roleDetail = {
        roleId      : role.Id,
        roleName    : role.Name,
        description : role.Description,
        status      : role.IsActive ? STATUS.ACTIVE : STATUS.INACTIVE,
        isActive    : role.IsActive,
        userId      : 0
      };
      permission = await getModuleWisePermission(0, roleId);
    }
    return next(
      new GeneralResponse(
        commonMessages.SUCCESS,
        { roleDetail, permission },
        httpStatusCode.HTTP_SUCCESS
      )
    );
  }),
  addEditRoleDetail: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('addEditRoleDetail'));
    const { roleDetail, permission } = req.body;
    let responseData;
    let responseMessage;
    const roleid = roleDetail.roleId;

    /**
     * roleid = 0 : Add Role
     * roleid > 0 : Update Role
     */
    if (roleid === 0) {
      const roleExist = await prisma.RoleMaster.count({
        where: { Name: roleDetail.roleName }
      });

      if (roleExist > 0) {
        return next(new BadRequest(messages.ROLE_ALREADY_EXIST));
      }

      const createRole = await prisma.RoleMaster.create({
        data: {
          Name        : roleDetail.roleName,
          Description : roleDetail.description,
          IsActive    : true,
          CreatedBy   : req.token.UserId,
          CreateDate  : new Date(getDateUTC())
        }
      });

      const createdRoleID = createRole.Id;

      const rolePermissionArray = [];

      permission.forEach(element => {
        const moduleElement = element.childs;
        moduleElement.forEach(element1 => {
          const moduleID = element1.moduleId;
          const childPermission = element1.permissions;
          childPermission.forEach(element2 => {
            const permissionId = element2.id;
            const { isDefault } = element2;
            const obj = {
              RoleId       : createdRoleID,
              ModuleId     : moduleID,
              PermissionId : permissionId,
              Permission   : isDefault,
              CreatedBy    : req.token.UserId,
              CreatedDate  : new Date(getDateUTC())
            };

            rolePermissionArray.push(obj);
          });
        });
      });

      await prisma.RolePermission.createMany({ data: rolePermissionArray });
      responseMessage = messages.ADD_ROLE_SUCCESS;
    } else if (roleid > 0) {
      const roleExists = await prisma.RoleMaster.count({
        where: { Id: roleid }
      });

      if (roleExists === 0) {
        return next(new BadRequest(messages.ROLE_NOT_FOUND));
      }

      await checkIfUserWithRoleExist(roleid, roleDetail, next);

      const roleNameExist = await prisma.RoleMaster.count({
        where: { Name: roleDetail.roleName, Id: { notIn: [roleid] } }
      });

      if (roleNameExist > 0) {
        return next(new BadRequest(messages.ROLE_ALREADY_EXIST));
      }

      await prisma.RoleMaster.update({
        where: {
          Id: roleid
        },
        data: {
          Name         : roleDetail.roleName,
          Description  : roleDetail.description,
          IsActive     : roleDetail.isActive,
          ModifiedBy   : req.token.UserId,
          ModifiedDate : new Date(getDateUTC())
        }
      });

      await prisma.RolePermission.deleteMany({ where: { RoleId: roleid } });

      const rolePermissionArray = [];

      permission.forEach(element => {
        const moduleElement = element.childs;
        moduleElement.forEach(element1 => {
          const moduleID = element1.moduleId;
          const childPermission = element1.permissions;
          childPermission.forEach(element2 => {
            const permissionId = element2.id;
            const { isDefault } = element2;
            const obj = {
              RoleId       : roleid,
              ModuleId     : moduleID,
              PermissionId : permissionId,
              Permission   : isDefault,
              CreatedBy    : req.token.UserId,
              CreatedDate  : new Date(getDateUTC())
            };

            rolePermissionArray.push(obj);
          });
        });
      });

      await prisma.RolePermission.createMany({ data: rolePermissionArray });
      responseMessage = messages.UPDATE_ROLE_SUCCESS;
    }

    return next(
      new GeneralResponse(
        responseMessage,
        responseData,
        httpStatusCode.HTTP_SUCCESS
      )
    );
  }),
  getAllRoleListing: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('getAllRoleListing'));
    const {
      globalSearchText, sortColumn, sortOrder, pageIndex, pageSize
    } = req.body;
    let sortby = 'CreateDate';
    const sortorder = 'desc';
    if (sortColumn) {
      sortby = await getSortBy(sortColumn);
    }
    const roles = await prisma.RoleMaster.findMany({
      skip : (pageIndex - 1) * pageSize,
      take : pageSize,
      where:
        globalSearchText && globalSearchText !== ''
          ? {
            OR: [
              { Name: { contains: globalSearchText } },
              { Description: { contains: globalSearchText } }
            ]
          }
          : {},
      include: {
        _count: {
          select: { User: true }
        }
      },
      orderBy: {
        [sortby]:
          sortOrder && sortOrder !== '' ? sortOrder.toLowerCase() : sortorder
      }
    });
    const rolesCount = await prisma.RoleMaster.count({
      where:
        globalSearchText && globalSearchText !== ''
          ? {
            OR: [
              { Name: { contains: globalSearchText } },
              { Description: { contains: globalSearchText } }
            ]
          }
          : {}
    });
    if (roles) {
      const rolesData = [];
      roles.forEach(role => {
        rolesData.push({
          id          : role.Id,
          name        : role.Name,
          description : role.Description,
          isActive    : role.IsActive,
          status      : role.IsActive ? 'Active' : 'Inactive',
          // eslint-disable-next-line no-underscore-dangle
          userCount   : role._count.User
        });
      });
      const responseData = {
        roleListingModel : rolesData,
        totalRecords     : rolesCount
      };
      return next(
        new GeneralResponse(
          messages.GET_ROLES,
          responseData,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(new BadRequest(messages.NO_RECORD_FOUND));
  }),
  getAllActiveRoles: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('getAllActiveRoles'));
    const roles = await prisma.RoleMaster.findMany({
      where: { IsActive: true }
    });
    if (roles) {
      const rolesData = [];
      roles.forEach(role => {
        rolesData.push({
          roleId   : role.Id,
          roleName : role.Name
        });
      });
      return next(
        new GeneralResponse(
          messages.GET_ROLES,
          rolesData,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(new BadRequest(messages.NO_RECORD_FOUND));
  }),

  updateRoleStatus: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('updateRoleStatus'));

    const { roleId, status } = req.body;

    // Find role using Id
    const role = await prisma.RoleMaster.count({
      where: { Id: roleId }
    });

    if (role > 0) {
      if (status === STATUS.INACTIVE) {
        const userWithRole = await prisma.User.count({
          where: { RoleId: roleId }
        });

        if (userWithRole > 0) {
          const ERR_MESSAGE = userWithRole > 1
              ? messages.CANNOT_INACTIVATE_ROLE.replace(/<n>/, userWithRole)
              : messages.CANNOT_INACTIVATE_ROLE.replace(
                  /<n>/,
                  userWithRole
              ).replace(/employees/, employee);

          return next(new BadRequest(ERR_MESSAGE));
        }
      }

      await prisma.RoleMaster.update({
        where: {
          Id: roleId
        },
        data: {
          IsActive     : status === STATUS.ACTIVE,
          ModifiedBy   : req.token.UserId,
          ModifiedDate : new Date(getDateUTC())
        }
      });

      return next(
        new GeneralResponse(
          status === STATUS.ACTIVE
            ? messages.ACTIVATE_ROLE_SUCCESS
            : messages.INACTIVATE_ROLE_SUCCESS,
          null,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }

    return next(new BadRequest(messages.ROLE_NOT_FOUND));
  })
};
