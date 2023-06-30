console.log("backEnd start");
const express = require('express');
const { getDb, mongoConnect } = require('./src/utils/mongodb')

const app = express();

app.listen(3000, () => {
  console.log("application listening.....");
});

const fs = require('fs');
const readline = require('readline');
const path = '/Users/xuerong/workspace/nano_dash/files/analyticEvents'
const path1 = '/Users/xuerong/workspace/nano_dash/files/analyticEvents-json'

mongoConnect();

// new Date(2023,5,30) -> 1688097600000    2023_06_30
// new Date(2023, 4, 1) -> 1682913600000   2023_05_01


new Promise(resolve => setTimeout(resolve, 5000))
.then(_ => {
  // etl(1682913600000, 1688097600000, '2023_05_01', '2023_06_30')
  // dumpToMongodb(path1);
  // etlToGroupByGatewayToken(path1);
  stageSumary();
})

const stageSumary = async _ => {
  const db = getDb();
  const stages = [
    'GATEWAY_PAYMENT_REQUEST',
    'GATEWAY_SERVICE_USER_AGENT',
    [{$match: { name: {$regex: new RegExp('GATEWAY_SERVICE')} }}, {$count: "total"}, {$project: {"GATEWAY_SERVICE": {$divide: ['$total', 2]}}}],
    'SCREEN_RESOLUTION',
    'WINDOW_RESOLUTION',
    'INIT_BANK_LOGIN_FLOW',
    // start: may have multiple 
    'VIEW_LOAD_flinksRoot',
    // 'VIEW_LOAD_bank_CA_data',
    'INSTITUTION_SELECTED',
    'VIEW_LOAD_flinksConnect',
    // end: may have multiple 
    'FLINKS_EVT_APP_MOUNTED',
    'FLINKS_EVT_COMPONENT_LOAD_CREDENTIAL',
    'FLINKS_EVT_SUBMIT_CREDENTIAL',
    'UNKNOWN_FLINKS_EVT',
    'FLINKS_EVT_COMPONENT_LOAD_MFA',
    'FLINKS_EVT_SUBMIT_MFA',
    'FLINKS_EVT_COMPONENT_LOAD_ACCOUNT_SELECTION',
    'FLINKS_EVT_ACCOUNT_SELECTED',
    'FLINKS_EVT_REDIRECT',
    'PaymentRequestAgent_',
    'TokenPutAgent',
    'PostToWindowAgent',
    [{$match: { name: {$regex: new RegExp('ONBOARDING_UPDATED')} }}, {$count: "total"}, {$project: {"ONBOARDING_UPDATED": {$divide: ['$total', 2]}}}],
    'TRANSACTION_CREATED'
  ]

  for ( let stage of stages ) {
    let aggregation = [{$match: { name: {$regex: new RegExp(stage)} }},{$count: stage}];
    if ( typeof stage === 'object' ) {
      aggregation = stage;
    }

    let result = await db
      .collection('analyticEvent')
      .aggregate(aggregation)
      .next()
    console.log(result);
  }
}

// data base on the trace Id
const etlToGroupByGatewayToken = (path) => {
  const db = getDb(); 
  const cache = new Map();
  const fileStream = fs.createReadStream(path);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let totalLine = 0;
  let noTraceId = 0;
  let maxSizeArray = 0;
  rl.on('line', async (line) => {
    totalLine++;
    var obj = eval('(' + line + ')');
    var createdAt = new Date(obj.timestamp);
    obj['createdAt'] = createdAt;
    if ( ! obj.traceId ) {
      noTraceId++;
    } else {
      if ( ! (cache.has(obj.traceId )) ) cache.set(obj.traceId, [])
      cache.get(obj.traceId).push(obj);
      if ( cache.get(obj.traceId).length > maxSizeArray ) maxSizeArray = cache.get(obj.traceId).length;
    }
  });
  
  rl.on('close', async () => {
    console.log('Finished reading the file.');
    console.log('totalLine: ' + totalLine);
    console.log('noTraceId: ' + noTraceId);
    console.log('maxSizeArray: ' + maxSizeArray);
    cache.forEach(async (value, key) => {
      // console.log(key)
      const obj = {
        gatewayTokenId: key,
        associatedAnalyticEvents: value.sort((a, b) => a.timestamp - b.timestamp)
      }
      const inserted = await db.collection('analyticEvent_groupby_traceId').insertOne(obj);
    })
  });
}
const dumpToMongodb = (path) => {
  const db = getDb(); 
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let totalLine = 0;
  rl.on('line', async (line) => {
    totalLine++;
    var obj = eval('(' + line + ')');
    var createdAt = new Date(obj.timestamp);
    obj['createdAt'] = createdAt;
    const inserted = await db.collection('analyticEvent').insertOne(obj);
    // await db.collection('analyticEvent').findOne({_id: inserted.insertedId})
  });
  
  rl.on('close', () => {
    console.log('Finished reading the file.');
    console.log('totalLine: ' + totalLine);
  });
}
const etl = (fromTime, endTime) => {
  const fileStream = fs.createReadStream(path);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let totalLine = 0;
  let totalJson = 0;
  let totalComment = 0;
  let pick = 0;
  rl.on('line', async (line) => {
    totalLine++;
    if ( line.startsWith("p(") ) {
      totalJson++;
      const jsonString = line.substring(2, line.length-1).replace(/\\"/g, "");
      var obj = eval('(' + jsonString + ')');
      if ( obj.timestamp < fromTime || obj.timestamp > endTime || !obj.timestamp) return;
      pick++;
      
      fs.appendFileSync(path1, jsonString + '\n');
    } else if ( line.startsWith("// Modified") ) {
    totalComment++;
  }
});

rl.on('close', () => {
  console.log('Finished reading the file.');
  console.log('totalLine: ' + totalLine);
  console.log('totalJson: ' + totalJson);
  console.log('totalComment ' + totalComment);
  console.log('pick: ' + pick);
});
}