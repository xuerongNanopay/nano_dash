const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const url = 'mongodb://root:123456@localhost:27017';

let _db;
const mongoConnect = async (database = 'nanopay') => {

  try {
    const client = await MongoClient.connect(url);
    console.log('Connect to MongoDb');
    _db = await client.db(database);
    console.log('Connect to database: ' + database);
  } catch ( err ) {
    console.log(err);
  }
}

const getDb = () => {
  if ( _db ) {
    return _db;
  }
  throw 'No database found!'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;