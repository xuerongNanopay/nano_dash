const { getDb } = require('../utils/mongodb')
const {
  stageSummary,
  stageSummaryGroupByBank,
  findDiffTokens,
  stageInstitutionCompareReport
} = require('../utils/analytic-event-report');

const { csvOutputter } = require('../utils/csv')

const getCollection = _ => {
  return getDb().collection('analyticEvent_groupby_traceId')
}
exports.getStageSummaryReport = async (req, resp, next) => {
  const summary = await stageSummary(getCollection());
  if ( req.query.format === 'csv' )
    resp.status(200).send(csvOutputter(summary));
  else resp.status(200).json(summary);
}


exports.getInstitutionSelectionReport = async (req, resp, next) => {
  const result = await stageSummaryGroupByBank(getCollection(), 'FLINKS_EVT_COMPONENT_LOAD_CREDENTIAL');
  if ( req.query.format === 'csv' )
    resp.status(200).send(csvOutputter(result));
  else resp.status(200).json(result);
}

exports.getSubmitCredentialReport = async (req, resp, next) => {
  const result = await stageSummaryGroupByBank(getCollection(), 'FLINKS_EVT_SUBMIT_CREDENTIAL');
  if ( req.query.format === 'csv' )
    resp.status(200).send(csvOutputter(result));
  else resp.status(200).json(result);
}

exports.getAccountSelectedReport = async (req, resp, next) => {
  const result = await stageSummaryGroupByBank(getCollection(), 'FLINKS_EVT_ACCOUNT_SELECTED');
  if ( req.query.format === 'csv' )
    resp.status(200).send(csvOutputter(result));
  else resp.status(200).json(result);
}

exports.getStageInstitutionCompareReport = async (req, resp, next) => {
  const result = await stageInstitutionCompareReport(getCollection(), 'FLINKS_EVT_COMPONENT_LOAD_CREDENTIAL', 'FLINKS_EVT_ACCOUNT_SELECTED');
  if ( req.query.format === 'csv' )
    resp.status(200).send(csvOutputter(result));
  else resp.status(200).json(result);
}

exports.getRokenMissingCapability = async (req, resp, next) => {
  const result = await findDiffTokens(getCollection(), 'ONBOARDING_UPDATED', 'TRANSACTION_CREATED');
  if ( req.query.format === 'csv' )
    resp.status(200).send(csvOutputter(result));
  else resp.status(200).json(result);
}

  // const collection = getDb().collection('analyticEvent_groupby_traceId');
  // console.log(await stageSummary(collection))

  // // console.log(await stageSummaryGroupByBank(collection, 'INSTITUTION_SELECTED'))

  // console.log(await stageInsitutionCompare(collection, 'FLINKS_EVT_COMPONENT_LOAD_CREDENTIAL', 'FLINKS_EVT_SUBMIT_CREDENTIAL'));

  // // console.log(await findDiffTokens(collection, 'ONBOARDING_UPDATED', 'TRANSACTION_CREATED'));