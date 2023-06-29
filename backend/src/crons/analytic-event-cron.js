const cron = require('node-cron');

const pullAnalyticEvent = () => {
  cron.schedule("0 0 */1 * * *", function () {
    console.log('TODO: pull')
  }, null, true, 'America/New_York');
}

exports.pullAnalyticEvent = pullAnalyticEvent;