const fs = require('fs');
const readline = require('readline');
const { getDb, mongoConnect } = require('../src/utils/mongodb')

const runETL = async _ => {
  console.log('ETL start')
  await mongoConnect();
  const db = getDb();
}

runETL();

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
      let firstSelectBank = '';
      let selectBanks = [];
      let firstSubmitCredentialBank = '';
      let submitCredential = [];
      let screenResulation= '';
      let windowResulation= '';
      let userType = '';
      let isBankLogin = false;
      let onboardType = ''
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

        if ( event.name === 'INIT_BANK_LOGIN_FLOW' || event.name === 'INIT_CHEQUE_FLOW' ) {
          isBankLogin = true;
          onboardType = event.name === 'INIT_BANK_LOGIN_FLOW' ? 'Flinks' : 'VC';
        }

        if ( event.name.indexOf('INSTITUTION_SELECTED') !== -1 ) {
          if ( firstSelectBank === '' ) firstSelectBank = event.name.substring(0, event.name.indexOf('INSTITUTION_SELECTED')-1);
          selectBanks.push(event.name.substring(0, event.name.indexOf('INSTITUTION_SELECTED')-1));
        }

        if ( event.name === 'FLINKS_EVT_SUBMIT_CREDENTIAL' ) {
          const flinksMessage = event.extra;
          if ( flinksMessage.indexOf('institution:') !== -1 ) {
            if ( firstSubmitCredentialBank === '' ) firstSubmitCredentialBank = flinksMessage.substring(flinksMessage.indexOf('institution:') + 12, flinksMessage.length-1);
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
        firstSelectBank,
        submitCredential,
        firstSubmitCredentialBank,
        screenResulation,
        windowResulation,
        userType,
        onboardType,
        eventCount,
        analyticEvents: analyticEvents,
        grayLogUrl: graloyUrlBuilder(analyticEvents[0].timestamp, analyticEvents[len-1].timestamp, 20)
      }
      const inserted = await db.collection(toCollection).insertOne(obj);
    })
  });
}

const graloyUrlBuilder = (from, to, includeRange=30) => {
  const toTime = to + includeRange*1000;
  const fromTime = from - includeRange*1000;
  const fromDate = new Date(fromTime);
  const toDate = new Date(toTime);
  let [fromY, fromMM, fromD, fromH, fromM, fromS] = new Array(6).fill(0);
  let [toY, toMM, toD, toH, toM, toS] = new Array(6).fill(0);
  fromY = fromDate.getUTCFullYear();
  fromMM = fromDate.getUTCMonth()+1;
  fromD = fromDate.getUTCDate();
  fromH = fromDate.getUTCHours();
  fromM = fromDate.getUTCMinutes();
  fromS = fromDate.getUTCSeconds();

  toY = toDate.getUTCFullYear();
  toMM = toDate.getUTCMonth()+1;
  toD = toDate.getUTCDate();
  toH = toDate.getUTCHours();
  toM = toDate.getUTCMinutes();
  toS = toDate.getUTCSeconds();

  return `https://ca-graylog.nanopay.net/search?q=&rangetype=absolute&from=${fromY}-${fromMM}-${fromD}T${fromH}%3A${fromM}%3A${fromS}.000Z&to=${toY}-${toMM}-${toD}T${toH}%3A${toM}%3A${toS}.999Z`;
}