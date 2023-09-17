const { ClientSecretCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

const url = process.env.AZURE_KEYVAULT_URL;

const client = new SecretClient(url, credential);

async function getSecretKey(secretKey) {
  return (await client.getSecret(`${secretKey}`)).value;
}

module.exports = { getSecretKey };
