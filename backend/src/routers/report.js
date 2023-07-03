const express = require('express');

const reportController = require('../controllers/report')

const reportRouter = express.Router();

reportRouter.get('/stageSummaryReport',  reportController.getStageSummaryReport);
reportRouter.get('/institutionSelectionReport', reportController.getInstitutionSelectionReport);
reportRouter.get('/submitCredentialReport', reportController.getSubmitCredentialReport);
reportRouter.get('/selectedAccountReport', reportController.getAccountSelectedReport);
reportRouter.get('/institutionSelectedVsSubmitCredentialReport', reportController.getInstitutionSelectedVsSubmitCredentialReport);
reportRouter.get('/submitCredentiaVsAccountSelectedReport', reportController.getSubmitCredentiaVsAccountSelectedReport);
reportRouter.get('/tokenMissingCapability', reportController.getTokenMissingCapability)


module.exports = reportRouter;