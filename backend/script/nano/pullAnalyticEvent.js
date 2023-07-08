//: node pullAnalyticEvent.js yourToken 2023-11-18T00:00 2023-06-18T00:00 America/Toronto
const { convertToDigRangeFromUTC, convertToDigRangeFromDefaultTZ} = require('./digTimestampQuery');
const { digWebAgent } = require('./pullDAO')

const token = process.argv[2];
const startT = process.argv[3];
const endT = process.argv[4];
const timeZone = process.argv[5] || 'UTC';

//endT not include.
const pullAnalyticEvent = async ({ token, startT, endT, isUTC=true}) => {
  let digStart;
  let digEnd;

  if ( isUTC ) {
    [digStart, digEnd] = convertToDigRangeFromUTC(startT, endT);
  } else {
    [digStart, digEnd] = convertToDigRangeFromDefaultTZ(startT, endT);
  }

  const url = "https://ca-prod-mediator1.nanopay.net:8443";
  const query = `service/dig?dao=analyticEventDAO&cmd=select&format=json&q=timestamp%3E%3D${digStart}%20AND%20timestamp%3C${digEnd}`;
  console.log(query)
  return await digWebAgent(
    {
      token,
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

