//: node pullAnalyticEvent.js yourToken 2023-11-18T00:00 2023-06-18T00:00 America/Toronto
const { convertToDigRangeFromUTC, convertToDigRangeFromDefaultTZ} = require('./digTimestampQuery');
const { digWebAgent } = require('./digWebAgent');

//endT not include.
const pullAnalyticEvent = async (token, startT, endT, isUTC=true) => {
  let digStart;
  let digEnd;
  if ( isUTC ) {
    [digStart, digEnd] = convertToDigRangeFromUTC(startT, endT);
  } else {
    [digStart, digEnd] = convertToDigRangeFromDefaultTZ(startT, endT);
  }

  const url = "https://ca-prod-mediator1.nanopay.net:8443";
  const query = `service/dig?dao=analyticEventDAO&cmd=select&format=json&q=timestamp%3E%3D${digStart}%20AND%20timestamp%3C${digEnd}&limit=0`;
  console.log(query)
  const resp = await digWebAgent(
    {
      token,
      url,
      query
    }
  )
  return resp.data;
}

module.exports = {
  pullAnalyticEvent
}

