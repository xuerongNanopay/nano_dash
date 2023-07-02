const startApp = async () => {
  console.log('Nano Dash App');
  const { getDb, mongoConnect } = require('./src/utils/mongodb');
  const { stageSummary } = require('./src/utils/analytic-event-report');
  await mongoConnect();

  const collection = getDb().collection('analyticEvent_groupby_traceId');
  console.log(await stageSummary(collection))

  const express = require('express');
  const app = express();
  app.listen(3000, () => {
    console.log("Listening at port: " + 3000);
  });
}
startApp();