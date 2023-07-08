//: node pullAnalyticEvent.js yourToken 2023-11-18T00:00 2023-06-18T00:00 America/Toronto
const axios = require('axios');
const https = require('https');
const moment = require('moment-timezone');

// America/Toronto
const token = process.argv[2];
const start_i = process.argv[3].replace('T', ' ');
const end_i = process.argv[4].replace('T', ' ');
const timeZome = process.argv[5] || 'Etc/Greenwich';

const start = moment.tz(start_i, timeZome);
const end = moment.tz(end_i, timeZome);

const startUTC = start.format('YYYY-MM-DDThh[%3A]mm')
const endUTC = end.format('YYYY-MM-DDThh[%3A]mm');

console.log(startUTC);
console.log(endUTC);
const URL = "https://ca-prod-mediator1.nanopay.net:8443";
const query = `service/dig?dao=analyticEventDAO&cmd=select&format=json&q=timestamp%3E%3D${startUTC}%20AND%20timestamp%3C${endUTC}`;

console.log(`${URL}/${query}`);
const axios_conn = axios.create({
  baseURL: URL,
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  }),
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

axios_conn
  .get(query)
  .then(resp => {
    console.log(resp.data)
  })
  .catch(err => {
    console.log(err)
  })

