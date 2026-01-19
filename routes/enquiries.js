const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// public submit
router.post('/', enquiryController.create);
// Get enquiry by payment token (public route for payment)
router.get('/payment/:token', enquiryController.getByPaymentToken);
// admin view
router.get('/', auth, adminOnly, enquiryController.list);
router.put('/:id/status', auth, adminOnly, enquiryController.updateStatus);

module.exports = router;
