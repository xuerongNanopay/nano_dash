const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const url = 'mongodb://root:123456@localhost:27017';

let _db;
let _client;
const mongoConnect = async (database = 'nanopay') => {

  try {
    _client = await MongoClient.connect(url);
    console.log('Connect to MongoDb');
    _db = await _client.db(database);
    console.log('Connect to database: ' + database);
  } catch ( err ) {
    console.log(err);
  }
}

const mongoDisconnect = _ => {
  _client.close();
}

const getDb = () => {
  if ( _db ) {
    return _db;
  }
  throw 'No database found!'
}

exports.mongoConnect = mongoConnect;
exports.mongoDisconnect = mongoDisconnect;
exports.getDb = getDb;