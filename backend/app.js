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
    // convertData();
    // etl(1682913600000, 1688097600000, '2023_05_01', '2023_06_30')
    dumpToMongodb(path1);
  })

// data base on the trace Id
const convertData = _ => {
  const db = getDb(); 
  const cache = new Map();
  const fileStream = fs.createReadStream(path2);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let totalLine = 0;
  let totalJson = 0;
  let totalComment = 0;
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
    console.log('totalJson: ' + totalJson);
    console.log('totalComment ' + totalComment);
    console.log('noTraceId: ' + noTraceId);
    console.log('cache size: ' + cache.size)
    console.log('maxSizeArray: ' + maxSizeArray)

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