const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

router.post('/', vendorController.createVendor.bind(vendorController));
router.get('/', vendorController.getAllVendors.bind(vendorController));

module.exports = router;
