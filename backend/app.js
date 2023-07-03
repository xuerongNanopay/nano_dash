const startApp = async () => {
  console.log('Nano Dash App');
  const { getDb, mongoConnect } = require('./src/utils/mongodb');
  const { 
    stageSummary,
    stageSummaryGroupByBank,
    findDiffTokens,
    stageInsitutionCompare
  } = require('./src/utils/analytic-event-report');
  await mongoConnect();

  const collection = getDb().collection('analyticEvent_groupby_traceId');
  console.log(await stageSummary(collection))

  // console.log(await stageSummaryGroupByBank(collection, 'INSTITUTION_SELECTED'))

  console.log(await stageInsitutionCompare(collection, 'FLINKS_EVT_COMPONENT_LOAD_CREDENTIAL', 'FLINKS_EVT_SUBMIT_CREDENTIAL'));

  // console.log(await findDiffTokens(collection, 'ONBOARDING_UPDATED', 'TRANSACTION_CREATED'));

  const express = require('express');
  const app = express();
  app.listen(3000, () => {
    console.log("Listening at port: " + 3000);
  });
}
startApp();