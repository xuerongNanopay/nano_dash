const { dumpGatewayTokenToMongo } = require('./dump-gateway-token-to-mongo');

//node dump-analytic-events-to-mongo.js url token 2023-06-30T03:31 2023-06-30T03:32
const url = process.argv[2];
const token = process.argv[3];
const startT = process.argv[4];
const endT = process.argv[5];
console.log(dumpGatewayTokenToMongo)
dumpGatewayTokenToMongo(url, token, startT, endT);