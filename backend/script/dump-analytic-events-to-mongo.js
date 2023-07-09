const { getDb, mongoConnect, mongoDisconnect } = require('../src/utils/mongodb')
const { pullAnalyticEvent } = require('./nano/pullAnalyticEvent');

const dump = async (token, start, end) => {
  console.log('========Dump Analytic Event To Mongo========');
  await mongoConnect();
  const db = getDb();

  const events = await pullAnalyticEvent(token, start, end);
  for ( const e of events ) {
    const formattedDate = new Date(e.timestamp.replace('Z', '+00:00'));
    e.timestamp = formattedDate.getTime();
    e.createdAt = formattedDate;
    const result = await db
            .collection('analyticEvent')
            .updateOne(
              {
                id: e.id
              },
              {
                $setOnInsert: e
              },
              {upsert: true}
            )
    console.log(result)
  }

  mongoDisconnect();
}

//node dump-analytic-events-to-mongo.js token 2023-06-30T03:31 2023-06-30T03:32
const token = process.argv[2];
const startT = process.argv[3];
const endT = process.argv[4];
dump(token, startT, endT);