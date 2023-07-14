const { getDb, mongoConnect, mongoDisconnect } = require('../src/utils/mongodb')
const { pullGatewayToken } = require('./nano/pullGatewayToken');

const COLLECTION_GATEWAY_TOKEN = (posfix) => 'gateway_tokens_'+posfix;

const dumpGatewayTokenToMongo = async (url, token, start, end) => {
  console.log('========Dump GatewayToken To Mongo========');
  const events = await pullGatewayToken(url, token, start, end);
  console.log(events)
}

module.exports = {
  dumpGatewayTokenToMongo
}