const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const url = 'mongodb://root:123456@localhost:27017';

let _db;
const mongoConnect = _ => {
  return MongoClient.connect(url)
  .then(client => {
    console.log('mongodb collect')
    _db = client.db('nanopay');
    return _db;
  })
  .catch(err => {
    console.log(err)
    throw err;
  });
}

const getDb = () => {
  if ( _db ) {
    return _db;
  }
  throw 'No database found!'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;