const { getDb, mongoConnect, mongoDisconnect } = require('../src/utils/mongodb')
const { pullAnalyticEvent } = require('./nano/pullAnalyticEvent');

const COLLECTION_ANALYTIC_EVENT = 'analyticEvent_test';
const COLLECTION_GATEWAY_TOKEN = 'gatewayToken_test';

const dump = async (token, start, end) => {
  console.log('========Dump Analytic Event To Mongo========');
  await mongoConnect();
  const db = getDb();

  const events = await pullAnalyticEvent(token, start, end);
  console.log("Analytic Event Size: " + events.length);
  let insertAnalyticEventCount = 0;
  let insertGatewayTokenCount = 0;
  let updateGatewayTokenCount = 0;
  for ( const e of events ) {
    const formattedDate = new Date(e.timestamp.replace('Z', '+00:00'));
    e.timestamp = formattedDate.getTime();
    e.createdAt = formattedDate;
    insertAnalyticEventCount += await populateAnalyticEvent(db, e);
    const [insert, update] = await populateGatewayToken(db, e);
    insertGatewayTokenCount += insert;
    updateGatewayTokenCount += update;
  }

  console.log("Insert Analytic Event: " + insertAnalyticEventCount);
  console.log("Insert GateWay Token: " + insertGatewayTokenCount);
  console.log("Update GateWay Token: " + updateGatewayTokenCount);
  mongoDisconnect();
}

async function populateAnalyticEvent(db, event) {
  const result = await db
  .collection(COLLECTION_ANALYTIC_EVENT)
  .updateOne(
    {
      id: event.id
    },
    {
      $setOnInsert: event
    },
    {upsert: true}
  )
  return result.upsertedCount;
}

async function populateGatewayToken(db, event) {
  const token = await db.collection(COLLECTION_GATEWAY_TOKEN).findOne({gatewayTokenId: event.traceId});
  if ( token && isEventExistInToken(token, event) ) return [0, 0];
  let updateToken;
  if ( ! token ) {
    updateToken = createGatewayToken(event);
  } else {
    updateToken = appendGatewayToken(token, event);
  }

  updateToken = populateFieldsForGatewayToken(updateToken);

  const result = await db
    .collection(COLLECTION_GATEWAY_TOKEN)
    .replaceOne(
      {gatewayTokenId: updateToken.gatewayTokenId}, 
      updateToken,
      {upsert: true}
    );
  return [result.upsertedCount, result.modifiedCount];
}


function populateFieldsForGatewayToken(gatewayToken) {
  let analyticEvents = gatewayToken.analyticEvents;
  analyticEvents = analyticEvents.sort((a, b) => a.timestamp - b.timestamp);
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
  let onboardType = '';
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
  return {
    ...gatewayToken,
    analyticEventsCount: len,
    startTime: analyticEvents[0].createdAt,
    endTime: analyticEvents[len-1].createdAt,
    startEvent: analyticEvents[0].name,
    endEvent: analyticEvents[len-1].name,
    isBankLogin: isBankLogin,
    selectBanks: selectBanks,
    firstSelectBank: firstSelectBank,
    submitCredential: submitCredential,
    firstSubmitCredentialBank: firstSubmitCredentialBank,
    screenResulation: screenResulation,
    windowResulation: windowResulation,
    userType: userType,
    onboardType: onboardType,
    eventCount: eventCount,
    analyticEvents: analyticEvents,
    grayLogUrl: graloyUrlBuilder(analyticEvents[0].timestamp, analyticEvents[len-1].timestamp, 20)
  }
}

function appendGatewayToken(token, event) {
  token.analyticEvents.push(event);
  return token;
}

function isEventExistInToken(token, event) {
  const e = token.analyticEvents.find(e => e.id === event.id);
  return !!e;
}

function createGatewayToken(event) {
  return {
    gatewayTokenId: event.traceId,
    analyticEvents: [event],
  }
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

//node dump-analytic-events-to-mongo.js token 2023-06-30T03:31 2023-06-30T03:32
const token = process.argv[2];
const startT = process.argv[3];
const endT = process.argv[4];
dump(token, startT, endT);