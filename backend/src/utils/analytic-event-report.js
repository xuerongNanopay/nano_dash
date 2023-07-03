const {
  includeEvent,
  excludeEvent,
  includeEventAgg,
  diffStage,
  diffStageAgg,
  eventBefore,
  eventAfter,
  eventIn
} = require('./analytic-event-predicate')

const DEFAULT_STAGE = [
  'GATEWAY_PAYMENT_REQUEST',
  'GATEWAY_SERVICE_USER_AGENT',
  'GATEWAY_SERVICE',
  'SCREEN_RESOLUTION',
  'WINDOW_RESOLUTION',
  'INIT_BANK_LOGIN_FLOW',
  // start: may have multiple 
  'VIEW_LOAD_flinksRoot',
  // 'VIEW_LOAD_bank_CA_data',
  'INSTITUTION_SELECTED',
  'VIEW_LOAD_flinksConnect',
  // end: may have multiple 
  'FLINKS_EVT_APP_MOUNTED',
  'FLINKS_EVT_COMPONENT_LOAD_CREDENTIAL',
  'FLINKS_EVT_SUBMIT_CREDENTIAL',
  'UNKNOWN_FLINKS_EVT',
  'FLINKS_EVT_COMPONENT_LOAD_MFA',
  'FLINKS_EVT_SUBMIT_MFA',
  'FLINKS_EVT_COMPONENT_LOAD_ACCOUNT_SELECTION',
  'FLINKS_EVT_ACCOUNT_SELECTED',
  'FLINKS_EVT_REDIRECT',
  'PaymentRequestAgent_',
  'TokenPutAgent',
  'PostToWindowAgent',
  'ONBOARDING_UPDATED',
  'TRANSACTION_CREATED'
]

//eventAfter('May 01 2023 00:00:00 EDT')
const stageSummary = async (collection, dateRange=null, stages=DEFAULT_STAGE) => {
  try {
    const dateArangeArr = !dateRange ? {$match: {}} : {$match: dateRange};
    const ret = [];
    for ( const stage of stages ) {
      const result = await collection
                            .aggregate([
                              dateArangeArr,
                              includeEventAgg(stage),
                              // {$count: stage},
                              { $group: { _id: null, total: { $sum: 1 } } },
                              { $project: { _id: 0, stage: stage, count: "$total" } }
                            ]).next();
      ret.push(result)
    }
    return ret;
  } catch ( err ) {
    console.log(err);
    throw err
  }
}

const stageSummaryGroupByBank = async (collection, stage, dateRange=null) => {
  try {
    const dateArangeArr = !dateRange ? {$match: {}} : {$match: dateRange};
    const result = await collection
    .aggregate([
      dateArangeArr,
      includeEventAgg(stage),
      {
        $group: {
          _id: "$firstSelectBank",
          total: { $count: {} },
          personal: { $sum: {$cond: [{$eq: ['$userType', 'PERSONAL']}, 1, 0]}},
          business: { $sum: {$cond: [{$eq: ['$userType', 'BUSINESS']}, 1, 0]}},
        }
      },
      {
        $sort: {
          total: -1
        }
      },
      {
        $project: {
          _id: 0,
          bank: '$_id',
          personal: '$personal',
          business: '$business',
          total: '$total'
        }
      }
    ]).toArray();
    return result;
  } catch ( err ) {
    console.log(err);
    throw err
  }
}

//TODO: project
const findDiffTokens = async (collection, stage1, stage2, dateRange = null) => {
  try {
    const results = collection.find({
                      $and: [
                        ! dateRange ? {} : dateRange,
                        includeEvent(stage1),
                        excludeEvent(stage2)
                      ]
                    })
                    .project(
                      {
                        _id: 0,
                        gatewayTokenId: 1,
                        startTime: 1,
                        endTime: 1,
                        startEvent: 1,
                        endEvent: 1,
                        isBankLogin: 1,
                        firstSelectBank: 1,
                        firstSubmitCredentialBank: 1,
                        userType: 1,
                        screenResulation: 1,
                        windowResulation: 1,
                        grayLogUrl: 1
                      }
                    ).toArray()
    return results;
  } catch ( err ) {
    console.log(err);
    throw err
  }
}

const stageInsitutionCompare = async (collection, stage1, stage2, dateRange=null) => {
  try {
    const preResult = await stageSummaryGroupByBank(collection, stage1, dateRange);
    const postResult = await stageSummaryGroupByBank(collection, stage2, dateRange);
    const cache = {};

    preResult.forEach(bankItem => {
      if ( ! (bankItem.bank in cache) ) cache[bankItem.bank] = {[stage1]: bankItem, [stage2]: {bank: bankItem.bank, personal: 0, business: 0, total: 0}};
    })
    postResult.forEach(bankItem => {
      // weird case: set to negative value for notice.
      if ( ! cache[bankItem.bank] ) cache[bankItem.bank][stage1] = {bank: bankItem.bank, personal: -1, business: -1, total: -1};
      cache[bankItem.bank][stage2] = {...cache[bankItem.bank][stage2], ...bankItem};
    })
    return cache;
  } catch ( err ) {
    console.log(err);
    throw err
  }
}

const stageInstitutionCompareReport = async (collection, stage1, stage2, dateRange=null) => {
  const stageCompare = await stageInsitutionCompare(collection, stage1, stage2, dateRange);
  const result = [];

  for (const [key, value] of Object.entries(stageCompare)) {
    const tmp = {institution: key}
    tmp[stage1+"-personal"] = value[stage1].persional;
    tmp[stage1+"-business"] = value[stage1].business;
    tmp[stage1+"-total"] = value[stage1].total;
    tmp[stage2+"-personal"] = value[stage2].persional;
    tmp[stage2+"-business"] = value[stage2].business;
    tmp[stage2+"-total"] = value[stage2].total;
    tmp.successRate = value[stage2].total/value[stage1].total
    result.push(tmp)
  }
  return result;
}

module.exports = {
  stageSummary,
  stageSummaryGroupByBank,
  findDiffTokens,
  stageInsitutionCompare,
  stageInstitutionCompareReport
}