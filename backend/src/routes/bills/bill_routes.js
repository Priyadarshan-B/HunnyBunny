const express = require('express');
const router = express.Router();
const bills = require("../../controllers/bills/bill");

router.post('/bill-details', bills.post_bill);
router.get('/bill-details', bills.get_bills);

module.exports = router;
