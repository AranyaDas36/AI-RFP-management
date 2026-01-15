const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');

router.post('/fetch-emails', proposalController.fetchEmails.bind(proposalController));

module.exports = router;
