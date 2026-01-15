const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfpController');

router.post('/', rfpController.createRFP.bind(rfpController));
router.get('/', rfpController.getAllRFPs.bind(rfpController));
router.get('/:id', rfpController.getRFPById.bind(rfpController));
router.post('/:id/send', rfpController.sendRFP.bind(rfpController));
router.get('/:id/proposals', rfpController.getRFPProposals.bind(rfpController));
router.post('/:id/evaluate', rfpController.evaluateRFP.bind(rfpController));

module.exports = router;
