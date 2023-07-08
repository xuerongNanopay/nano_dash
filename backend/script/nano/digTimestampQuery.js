const { formatInTimeZone } = require('date-fns-tz');
const { 
  startOfToday ,
  endOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  addMinutes
} = require('date-fns');

const winDate = new Date('2023-06-30T03:00:00')
console.log(winDate.toUTCString())
console.log(formatInTimeZone(winDate, 'Etc/Greenwich', "yyyy-MM-dd'T'HH'%3A'mm"))
console.log('---')

const _digTimeFormat = "yyyy-MM-dd'T'HH'%3A'mm";
function toUTCDigFormat(date) {
  return formatInTimeZone(date, 'Etc/Greenwich', _digTimeFormat);
}

function getDigRange(start, end) {
  console.log(start, end)
  return [toUTCDigFormat(start), toUTCDigFormat(addMinutes(end, 1))];
}

const getTimeRange = (option) => {
  switch(option) {
    case 'thisDay':
      return getDigRange(startOfToday(), endOfToday());
    case 'thisWeek':
      return getDigRange(startOfWeek(), endOfWeek());
    case 'thisMonth':
      return getDigRange(startOfMonth(), endOfMonth());
    case 'thisQuarter':
      return getDigRange(startOfQuarter(), endOfQuarter());
    default: 
      return ['start', 'end'];
  }
}

console.log('aaa')
const ret = getTimeRange('thisDay');
console.log(ret)