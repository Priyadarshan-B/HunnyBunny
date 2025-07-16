const express = require("express");
const router = express.Router();

const attendance = require("../../controllers/attendance/attendance");

router.get("/staffs", attendance.get_users);
router.get("/daily", attendance.get_attendance);
router.post("/daily", attendance.post_attendance);
router.patch("/daily", attendance.update_attendance);
router.post("/staffs", attendance.create_contact);
router.patch("/staffs/:id", attendance.update_contact);
router.delete("/staffs/:id", attendance.delete_contact);

module.exports = router;
