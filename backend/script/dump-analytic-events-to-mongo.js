const { formatInTimeZone } = require('date-fns-tz');
const { format } = require('date-fns');

const { getDb, mongoConnect } = require('../src/utils/mongodb')
const initialMongo = async _ => {
  console.log('ETL start')
  await mongoConnect();
  const db = getDb();
}
console.log(format)
const winDate = new Date('2014-06-25T00:00:00')
console.log(winDate.toUTCString())
console.log(format(winDate, "yyyy-MM-dd'T'HH'%3A'mm"))

// const sumDate = new Date('2014-12-25T00:00:00')
// console.log(sumDate.toUTCString())
// 1day, 2day, 4day, 1 week, 2 week, 1 month, customize. base on toronto.

const findTimeRange = (range) => {
  switch(range) {
    case '1day':
      break;
    case '2day':
      break;
    case '1week':
      break;
    case '2week':
      break;
    case '1month':
      break;
    default:
      break;
  }
}

const dump = async (start, end, timeZone) => {
  console.log('========Dump Analytic Event========');


  await mongoConnect();
  const db = getDb();
}

// 2023-11-18T00:00 2023-06-18T00:00 America/Toronto
// dump(start, end, timeZone);