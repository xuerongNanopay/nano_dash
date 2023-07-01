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
  // etl(1682913600000, 1688097600000, path, path1)
  // dumpToMongodb(path1, 'analyticEvent');
  // etlToGroupByGatewayToken(path1, 'analyticEvent_groupby_traceId');
  // stageSumary('analyticEvent');
  stageSummaryAfterGroup('analyticEvent_groupby_traceId');
})

// {awards: {$elemMatch: {award:'National Medal', year:1975}}}

const stageSummaryAfterGroup = async (collection) => {
  const db = getDb();
  const stages = [
    'GATEWAY_PAYMENT_REQUEST',
    'GATEWAY_SERVICE_USER_AGENT',
    'GATEWAY_SERVICE',
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
    'ONBOARDING_UPDATED',
    'TRANSACTION_CREATED'
  ]

  for ( let stage of stages ) {
    let aggregation = [{$match: { analyticEvents: {$elemMatch: {name: {$regex: new RegExp(stage)}}}}},{$count: stage}];

    let result = await db
      .collection(collection)
      .aggregate(aggregation)
      .next()
    console.log(result);
  }
}

const stageSumary = async (collection) => {
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
      .collection(collection)
      .aggregate(aggregation)
      .next()
    console.log(result);
  }
}

// data base on the trace Id
const etlToGroupByGatewayToken = (path, toCollection) => {
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
      const analyticEvents = value.sort((a, b) => a.timestamp - b.timestamp)
      const len = analyticEvents.length;
      let eventCount = {};
      let selectBanks = [];
      let submitCredential = [];
      let screenResulation= '';
      let windowResulation= '';
      let userType = '';
      let isBankLogin = false;
      for ( let i = 0 ; i < len ; i++ ) {
        const event = analyticEvents[i];

        if ( ! (event.name in eventCount) ) eventCount[event.name] = 1;
        else eventCount[event.name]++;

        if ( event.name === 'GATEWAY_PAYMENT_REQUEST' ) {
          userType = event.tags[0];
        }

        if ( event.name === 'GATEWAY_PAYMENT_REQUEST' ) {
          userType = event.tags[0];
        }

        if ( event.name === 'SCREEN_RESOLUTION' ) {
          screenResulation = event.extra
        }

        if ( event.name === 'WINDOW_RESOLUTION' ) {
          windowResulation = event.extra
        }

        if ( event.name === 'INIT_BANK_LOGIN_FLOW' ) {
          isBankLogin = true;
        }

        if ( event.name.indexOf('INSTITUTION_SELECTED') !== -1 ) {
          selectBanks.push(event.name.substring(0, event.name.indexOf('INSTITUTION_SELECTED')));
        }

        if ( event.name === 'FLINKS_EVT_SUBMIT_CREDENTIAL' ) {
          const flinksMessage = event.extra;
          if ( flinksMessage.indexOf('institution:') !== -1 ) {
            submitCredential.push(flinksMessage.substring(flinksMessage.indexOf('institution:') + 12, flinksMessage.length-1));
          }
        }

      }

      const obj = {
        gatewayTokenId: key,
        analyticEventsCount: len,
        startTime: analyticEvents[0].createdAt,
        endTime: analyticEvents[len-1].createdAt,
        startEvent: analyticEvents[0].name,
        endEvent: analyticEvents[len-1].name,
        isBankLogin,
        selectBanks,
        submitCredential,
        screenResulation,
        windowResulation,
        userType,
        eventCount,
        analyticEvents: analyticEvents
      }
      const inserted = await db.collection(toCollection).insertOne(obj);
    })
  });
}
const dumpToMongodb = (path, collection) => {
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
    const inserted = await db.collection(collection).insertOne(obj);
    // await db.collection('analyticEvent').findOne({_id: inserted.insertedId})
  });
  
  rl.on('close', () => {
    console.log('Finished reading the file.');
    console.log('totalLine: ' + totalLine);
  });
}
const etl = (fromTime, endTime, sourcePath, destinationPath) => {
  const fileStream = fs.createReadStream(sourcePath);
  
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
      
      fs.appendFileSync(destinationPath, jsonString + '\n');
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

// analytic events more than 60
//{$expr: {$gt: [{$size: "$associatedAnalyticEvents"}, 60]}}
// analytic events in between
//{$and: [{$expr: {$gte: [{$size: "$associatedAnalyticEvents"}, 50]}}, {$expr: {$lte: [{$size: "$associatedAnalyticEvents"}, 60]}}]}
// in one stage but not in other one
//{$and: [{ associatedAnalyticEvents: {$elemMatch: {name: {$regex: /GATEWAY_PAYMENT_REQUEST/}}}}, {$nor: [{associatedAnalyticEvents: {$elemMatch: {name: {$regex: /GATEWAY_SERVICE_USER_AGENT/}}}}]}]}
