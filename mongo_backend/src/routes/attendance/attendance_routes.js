const express = require("express");
const router = express.Router();

const attendance = require("../../controllers/attendance/attendance");

router.get("/staffs", attendance.get_users);
router.get("/daily", attendance.get_attendance);
router.post("/daily", attendance.post_attendance);
router.patch("/daily", attendance.update_attendance);
router.post("/staffs", attendance.create_contact);

module.exports = router;
