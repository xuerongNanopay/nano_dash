const { formatInTimeZone } = require('date-fns-tz');
const { format } = require('date-fns');
const { 
  startOfToday ,
  endOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYesterday,
  startOfYear,
  endOfYear,
  addMinutes,
  subMonths,
  subDays,
  subWeeks,
  parseISO
} = require('date-fns');

const winDate = new Date('2023-06-30T03:00' + '+00:00')
console.log(format(winDate, "yyyy-MM-dd'T'HH'%3A'mm"))
console.log(formatInTimeZone(winDate, 'Etc/Greenwich', "yyyy-MM-dd'T'HH'%3A'mm"))
console.log('---')

const _digTimeFormat = "yyyy-MM-dd'T'HH'%3A'mm";
function toUTCDigFormat(date) {
  return formatInTimeZone(date, 'Etc/Greenwich', _digTimeFormat);
}

function getUTCDigRange(start, end) {
  console.log(start, end)
  return [toUTCDigFormat(start), toUTCDigFormat(addMinutes(end, 1))];
}

//startTime and endTime will be treaded as UTC time
//eg: 2023-06-30T03:00
function convertToDigRangeFromUTC(startTime, endTime) {
  const start = new Date(startTime + '+00:00');
  const end = new Date(endTime + '+00:00');
  return [toUTCDigFormat(start), toUTCDigFormat(end)];
}

function convertToDigRangeFromDefaultTZ(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return [toUTCDigFormat(start), toUTCDigFormat(end)];
}

//The date return by this function is based on UTC of EST/PST(Toronto)
const getDigTimeRangWithDefaultTZ = (option) => {
  switch(option) {
    case 'thisDay':
      return getUTCDigRange(startOfToday(), endOfToday());
    case 'thisTwoDay':
      return getUTCDigRange(startOfYesterday(), endOfToday())
    case 'thisWeek':
      return getUTCDigRange(startOfWeek(startOfToday()), endOfWeek(startOfToday()));
    case 'thisMonth':
      return getUTCDigRange(startOfMonth(startOfToday()), endOfMonth(startOfToday()));
    case 'thisTwoMonth':
      return getUTCDigRange(subMonths(startOfMonth(startOfToday()), 1), endOfMonth(startOfToday()));
    case 'thisQuarter':
      return getUTCDigRange(startOfQuarter(startOfToday()), endOfQuarter(startOfToday()));
    case 'thisYear':
      return getUTCDigRange(startOfYear(startOfToday()), endOfYear(startOfToday()));
    default:
      const [startTime, endTime] = option.split("/");
      //TODO: health check.
      return [toUTCDigFormat(new Date(startTime)), toUTCDigFormat(new Date(endTime))]
    }
}

// getDigTimeRangWithDefaultTZ('2023-06-30T00:00/2023-06-30T04:00');
// console.log(convertToDigRangeFromUTCTime('2023-06-30T03:41', '2023-06-30T04:00'));

module.exports = {
  getDigTimeRangWithDefaultTZ,
  convertToDigRangeFromUTC,
  convertToDigRangeFromDefaultTZ
}