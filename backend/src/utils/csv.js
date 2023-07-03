const { Parser } = require('@json2csv/plainjs');

exports.csvOutputter = (data, fields) => {
  const opts = {};
  if ( !! fields ) opts.fields = fields;

  const json2csvParser = new Parser(opts);
  const csv = json2csvParser.parse(data);
  return csv;
}