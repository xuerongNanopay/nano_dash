const { pullAnalyticEvent } = require('./nano/pullAnalyticEvent');
const fs = require('fs');
const path = require('path')

const folderPath = path.join(__dirname, '../..', 'files');

const dumpAnalyticEventToFile = async (token, start, end) => {
  const fileName = 'analytic_event_' + start + '_' + end + '.txt';
  const filePath = path.join(folderPath, fileName)
  // if ( fs.existsSync(filePath) ) {
  //   console.warn('[Warn] fileName: ' + filePath + ' already exists')
  //   return;
  // }
  let events = await pullAnalyticEvent(token, start, end);
  for ( let e of events ) {
    const formattedDate = new Date(e.timestamp.replace('Z', '+00:00'));
    e.timestamp = formattedDate.getTime();
    e.createdAt = formattedDate;
  }
  console.log(events);
  // for ( let e of events ) {
  //   fs.appendFileSync(filePath, JSON.stringify(e) + '\n');
  // }
}


const token = process.argv[2];
const startT = process.argv[3];
const endT = process.argv[4];

//2023-06-30T03:41
//2023-07-08T23:00

dumpAnalyticEventToFile(token, startT, endT);