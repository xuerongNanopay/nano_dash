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

//{$match: eventAfter('May 01 2023 00:00:00 EDT')},
const stageSummary = async (collection, dateRange=null, stages=DEFAULT_STAGE) => {
  try {
    const dateArangeArr = !dateRange ? {$match: {}} : {$match: dateRange};
    const ret = [];
    for ( const stage of stages ) {
      const result = await collection
                            .aggregate([
                              dateArangeArr,
                              includeEventAgg(stage),
                              {$count: stage}
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
                    }).toArray()
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
    console.log(preResult)
    preResult.forEach(bankItem => {
      if ( ! (bankItem.bank in cache) ) cache[bankItem.bank] = {s1: bankItem, s2: null};
    })
    postResult.forEach(bankItem => {
      cache[bankItem.bank].s2 = bankItem;
    })
    return cache;
  } catch ( err ) {
    console.log(err);
    throw err
  }
}

module.exports = {
  stageSummary,
  stageSummaryGroupByBank,
  findDiffTokens,
  stageInsitutionCompare
}