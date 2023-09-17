const sortFieldOrder = async (sortField, sortOrder) => ((sortField === '' || sortField === null) && (sortOrder === '' || sortOrder === null) ? '' : `${sortField} ${sortOrder}`);

const skipFirst = async (first) => (first && first > 1 ? first - 1 : 0);

const skipOffSet = async (offset) => (offset >= 1 ? offset - 1 : 0);
module.exports = {
  commonListing: async (req) => {
    let { rows } = req;
    const {
      offset, perPage, first, sortOrder, sortField, filters, search
    } = req;
    const filterData = filters;
    let skip = 0;
    const andCondition = [];
    let allData = {};
    let value;
    if (filterData !== '') {
      const arrayData = filterData;
      for (const property in arrayData) {
        const criteria = property;
        const key = arrayData[property];
        value = keyValue(key);
        allData = { [criteria]: value };
        andCondition.push(allData);
      }
    }
    const sort = await sortFieldOrder(sortField, sortOrder);
    skip = await skipFirst(first);

    if (!rows && offset && perPage) {
      rows = perPage;
      skip = await skipOffSet(offset);
    }
    return {
      andCondition, rows, skip, sort, search
    };
  }
};
