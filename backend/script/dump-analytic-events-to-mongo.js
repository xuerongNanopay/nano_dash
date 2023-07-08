const { getDb, mongoConnect } = require('../src/utils/mongodb')
const initialMongo = async _ => {
  console.log('ETL start')
  await mongoConnect();
  const db = getDb();
}

// const sumDate = new Date('2014-12-25T00:00:00')
// console.log(sumDate.toUTCString())
// 1day, 2day, 4day, 1 week, 2 week, 1 month, customize. base on toronto.

const dump = async (start, end, isUTC=true) => {
  console.log('========Dump Analytic Event========');


  await mongoConnect();
  const db = getDb();
}

// 2023-11-18T00:00 2023-06-18T00:00 America/Toronto
// dump(start, end, timeZone);