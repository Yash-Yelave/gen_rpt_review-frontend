const { AwsClient } = require('aws4fetch');
const env = require('dotenv').config({path: '.dev.vars'}).parsed;

const aws = new AwsClient({
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  service: 's3',
  region: 'auto'
});

const baseUrl = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}`;
console.log('Fetching:', `${baseUrl}/catalog/catalog.json`);

aws.fetch(`${baseUrl}/catalog/catalog.json`).then(async res => {
  console.log('Status:', res.status);
  console.log('Text:', await res.text());
}).catch(console.error);
