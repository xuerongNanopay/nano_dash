//: node pullAnalyticEvent.js yourToken 2023-11-18T00:00 2023-06-18T00:00 America/Toronto
const moment = require('moment-timezone');
const { digWebAgent } = require('./pullDAO')

// America/Toronto
const token = process.argv[2];
const startT = process.argv[3].replace('T', ' ');
const endT = process.argv[4].replace('T', ' ');
const timeZone = process.argv[5] || 'Etc/Greenwich';

const pullAnalyticEvent = async ({ token, startT, endT, timeZone}) => {
  const start = moment.tz(startT, timeZone);
  const end = moment.tz(endT, timeZone);

  const startUTC = start.format('YYYY-MM-DDThh[%3A]mm')
  const endUTC = end.format('YYYY-MM-DDThh[%3A]mm');

  const url = "https://ca-prod-mediator1.nanopay.net:8443";
  const query = `service/dig?dao=analyticEventDAO&cmd=select&format=json&q=timestamp%3E%3D${startUTC}%20AND%20timestamp%3C${endUTC}`;

  return await digWebAgent(
    {
      token,
      daoKey: 'analyticEventDAO',
      startUTC,
      endUTC,
      url,
      query
    }
  );
}

pullAnalyticEvent(
  {
    token,
    startT,
    endT,
    timeZone
  }
)
.then(resp => console.log(resp.data))
.catch(err => console.log(err))

