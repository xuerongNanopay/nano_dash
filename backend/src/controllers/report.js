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
  const summary = await stageSummary(getCollection());
  resp.status(200).json(summary);
  // let output = "stage,count\n";
  // summary.forEach(s => output += s.stage+','+s.count+'\n');
  // resp.status(200).send(output)
}


exports.getInstitutionSelectionReport = async (req, resp, next) => {
  const result = await stageSummaryGroupByBank(getCollection(), 'FLINKS_EVT_COMPONENT_LOAD_CREDENTIAL');
  resp.status(200).json(result);
}

exports.getSubmitCredentialReport = async (req, resp, next) => {
  const result = await stageSummaryGroupByBank(getCollection(), 'FLINKS_EVT_SUBMIT_CREDENTIAL');
  resp.status(200).json(result);
}

exports.getAccountSelectedReport = async (req, resp, next) => {
  const result = await stageSummaryGroupByBank(getCollection(), 'FLINKS_EVT_ACCOUNT_SELECTED');
  resp.status(200).json(result);
}

  // const collection = getDb().collection('analyticEvent_groupby_traceId');
  // console.log(await stageSummary(collection))

  // // console.log(await stageSummaryGroupByBank(collection, 'INSTITUTION_SELECTED'))

  // console.log(await stageInsitutionCompare(collection, 'FLINKS_EVT_COMPONENT_LOAD_CREDENTIAL', 'FLINKS_EVT_SUBMIT_CREDENTIAL'));

  // // console.log(await findDiffTokens(collection, 'ONBOARDING_UPDATED', 'TRANSACTION_CREATED'));