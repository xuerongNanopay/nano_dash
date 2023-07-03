const { getDb } = require('../utils/mongodb')
const {
  stageSummary,
  stageSummaryGroupByBank,
  findDiffTokens,
  stageInsitutionCompare
} = require('../utils/analytic-event-report');

const getCollection = _ => {
  return getDb().collection('analyticEvent_groupby_traceId')
}
exports.getStageSummaryReport = async (req, resp, next) => {
  const summary = await stageSummary(getCollection())
  // resp
  resp.json(summary);
}

exports.getSubmitCredentialReport = async (req, resp, next) => {

}

exports.getAccountPickReport = async (req, resp, next) => {

}

