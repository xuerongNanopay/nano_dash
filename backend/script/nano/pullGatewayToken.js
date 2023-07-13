const { digWebAgent } = require('./digWebAgent')
const { convertToDigRangeFromUTC, convertToDigRangeFromDefaultTZ} = require('./digTimestampQuery');

const pullGatewayToken = async(url, token, startT, endT, isUTC=true) => {
  let start;
  let end;
  if ( isUTC ) {
    [start, end] = convertToDigRangeFromUTC(startT, endT);
  } else {
    [start, end] = convertToDigRangeFromDefaultTZ(startT, endT);
  }

  const query = `service/dig?dao=gatewayPaymentRequestDAO&cmd=select&format=json&q=created%3E%3D${digStart}%20AND%created%3C${digEnd}&limit=0`;
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
  pullGatewayToken
}
