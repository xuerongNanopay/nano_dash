const startApp = async () => {
  console.log('Nano Dash App');
  const { getDb, mongoConnect } = require('./utils/mongodb');
  const { 
    stageSummary,
    stageSummaryGroupByBank,
    findDiffTokens,
    stageInsitutionCompare
  } = require('./utils/analytic-event-report');
  await mongoConnect();

  const express = require('express');
  const bodyParser = require('body-parser');
  const reportRouter = require('./routers/report');
  const app = express();

  app.use(bodyParser.json())

  app.use('/report', reportRouter);

  app.use('*', (req, resp, next) => {
    resp
      .status(404)
      .json({
        message: 'Resource No Found.'
      })
  })

  app.use((err, req, resp, next) => {
    console.log(err);
    resp
      .status(err.statusCode || 500)
      .json({
        message: err.message,
        data: err.data
      })
  })
  app.listen(3000, () => {
    console.log("Listening at port: " + 3000);
  });
}
startApp();