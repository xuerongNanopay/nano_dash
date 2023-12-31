const { parseUTCDateToTimeStamp } = require('./DateTime');

const includeEvent = (event) => ({ analyticEvents: {$elemMatch: {name: {$regex: new RegExp(event)}}}})
// const includeEvent = (event) => ({ 'analyticEvents.name': {$regex: new RegExp(event)}})
const excludeEvent = (event) => ({ analyticEvents: {$not: {$elemMatch: {name: {$regex: new RegExp(event)}}}}})
const diffStage = (stage1, stage2) => ({$and: [includeEvent(stage1), excludeEvent(stage2)]})
const includeEventAgg = (event) => ({$match: includeEvent(event)})
const diffStageAgg = (stage1, stage2) => ({$match: diffStage(stage1, stage2)})
const eventBefore = (utcDateTimeString) => ({startTime: lteUTCTime(utcDateTimeString)});
const eventAfter = (utcDateTimeString) => ({startTime: gteUTCTime(utcDateTimeString)})
const eventIn = (startTimeString, endTimeString) => ({startTime: betweenUTCTime(startTimeString, endTimeString)});

const lteUTCTime = (utcDateTimeString) => (
  {$lte: new Date(parseUTCDateToTimeStamp(utcDateTimeString))}
)

const gteUTCTime = (utcDateTimeString) => (
  {$gte: new Date(parseUTCDateToTimeStamp(utcDateTimeString))}
)

const betweenUTCTime = (start, end) => (
  {
    $lte: new Date(parseUTCDateToTimeStamp(end)),
    $gte: new Date(parseUTCDateToTimeStamp(start))
  }
)

module.exports ={
  includeEvent,
  excludeEvent,
  includeEventAgg,
  diffStage,
  diffStageAgg,
  eventBefore,
  eventAfter,
  eventIn
}

// analytic events more than 60
//{$expr: {$gt: [{$size: "$associatedAnalyticEvents"}, 60]}}
// analytic events in between
//{$and: [{$expr: {$gte: [{$size: "$associatedAnalyticEvents"}, 50]}}, {$expr: {$lte: [{$size: "$associatedAnalyticEvents"}, 60]}}]}
// in one stage but not in other one
//{$and: [{ analyticEvents: {$elemMatch: {name: {$regex: /ONBOARDING_UPDATED/}}}}, {$nor: [{analyticEvents: {$elemMatch: {name: {$regex: /TRANSACTION_CREATED/}}}}]}]}
//{analyticEvents: {$elemMatch: {name: {$regex: /TRANSACTION_CREATED/}}}}
//{$and: [{ analyticEvents: {$elemMatch: {name: {$regex: /INSTITUTION_SELECTED/}}}}, {$nor: [{analyticEvents: {$elemMatch: {name: {$regex: /FLINKS_EVT_SUBMIT_CREDENTIAL/}}}}]}, {endEvent: /FLINKS_EVT_COMPONENT_LOAD_CREDENTIAL/}]}
//  {$and: [{ analyticEvents: {$elemMatch: {name: {$regex: /INSTITUTION_SELECTED/}}}}, {$nor: [{analyticEvents: {$elemMatch: {name: {$regex: /FLINKS_EVT_SUBMIT_CREDENTIAL/}}}}]}, {endEvent: {$not: /FLINKS_EVT_COMPONENT_LOAD_CREDENTIAL/}}]}
//  {$and: [{ analyticEvents: {$elemMatch: {name: {$regex: /INSTITUTION_SELECTED/}}}}, {$nor: [{analyticEvents: {$elemMatch: {name: {$regex: /FLINKS_EVT_SUBMIT_CREDENTIAL/}}}}]}, {endEvent: /FLINKS_EVT_COMPONENT_LOAD_CREDENTIAL/}]}
//  {$and: [{ analyticEvents: {$elemMatch: {name: {$regex: /INSTITUTION_SELECTED/}}}}]}  
// {
//   _id: "$firstSelectBank",
//   count: {
//     $count: {}
//   }
// }