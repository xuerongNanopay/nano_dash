const {
  includeEvent,
  excludeEvent,
  includeEventAgg,
  diffStage,
  diffStageAgg
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

const stageSummary = async (collection, stages=DEFAULT_STAGE) => {
  try {
    const ret = [];
    for ( const stage of stages ) {
      const result = await collection
                            .aggregate([
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

const stageSummaryGroupByBank = async (collection, stage) => {
  try {
    const result = await collection
    .aggregate([
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

module.exports = {
  stageSummary,
  stageSummaryGroupByBank
}