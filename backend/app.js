const app = express();

app.listen(3000, () => {
  console.log("application listening.....");
});

mongoConnect();

const startApp = async () => {
  console.log('Nano Dash App');
  const express = require('express');
  const { mongoConnect } = require('./src/utils/mongodb')
  await mongoConnect();


  app.listen(3000, () => {
    console.log("Listening at port: " + 3000);
  });
}
startApp();