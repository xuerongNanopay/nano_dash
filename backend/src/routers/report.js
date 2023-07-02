const express = require('express');

const reportController = require('../controllers/report')

const reportRouter = express.Router();

reportRouter.get('/submitCredential', reportController.getSubmitCredentialReprot);
reportRouter.get('/pickAccount', reportController.getAccountPickReport);

module.exports = reportRouter;