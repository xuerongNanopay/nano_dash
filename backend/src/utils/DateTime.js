// input format: May 01 2023 00:00:00 EDT / Jan 01 2023 00:00:00 EST
const parseUTCDateToTimeStamp = (utcDateString) => {
  return Date.parse(utcDateString);
}

module.exports = {
  parseUTCDateToTimeStamp
}