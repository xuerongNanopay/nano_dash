const express = require('express');

const reportController = require('../controllers/report')

const reportRouter = express.Router();

const formatExtractor = ( req, resp, next ) => {
  const format = req.query.format;
  switch ( format ) {
    case 'json':
      req.format = format;
      break;
    case 'csv':
      req.format = format;
      break;
    default:
      req.format = 'json';
      break;
  }
  next();
}

reportRouter.get('/stageSummaryReport', [ formatExtractor, reportController.getStageSummaryReport ]);
reportRouter.get('/institutionSelectionReport', reportController.getInstitutionSelectionReport);
reportRouter.get('/submitCredentialReport', formatExtractor, reportController.getSubmitCredentialReport);
reportRouter.get('/selectedAccountReport', formatExtractor, reportController.getAccountSelectedReport);


module.exports = reportRouter;