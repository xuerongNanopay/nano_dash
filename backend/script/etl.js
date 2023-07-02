const runETL = async _ => {
  console.log('ETL start')
  const { getDb, mongoConnect } = require('../src/utils/mongodb')
  await mongoConnect();
  const db = getDb();
  const fs = require('fs');
  const readline = require('readline');
}

runETL();