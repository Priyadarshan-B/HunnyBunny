const User = require('../../models/User')
const Role = require('../../models/Role')
const Attendance = require('../../models/Attendance')

exports.get_users = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const adminRole = await Role.findOne({ name: "Admin" });

    const staffUsers = await User.find({
      role: { $ne: adminRole?._id },
      status: "1",
    }).select("_id username email");

    const attendanceRecords = await Attendance.find({
      date: normalizedDate,
    });

    const attendanceMap = {};
    attendanceRecords.forEach((a) => {
      attendanceMap[a.userId.toString()] = a.status;
    });

    const usersWithStatus = staffUsers.map((user) => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      status: attendanceMap[user._id.toString()] || "Absent", // Default to Absent
    }));

    res.json(usersWithStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users with attendance" });
  }
};



exports.post_attendance = async(req, res)=>{
     const { userId, date, status } = req.body;
  try {
    const normalizedDate = new Date(date).setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { userId, date: normalizedDate },
      { status },
      { upsert: true, new: true }
    );

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save attendance' });
  }
}

exports.get_attendance = async(req,res)=>{
    const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const normalizedDate = new Date(date).setHours(0, 0, 0, 0);

    const adminRole = await Role.findOne({ name: 'Admin' });

    const users = await User.find({
      role: { $ne: adminRole?._id },
      status: '1'
    }).select('_id username email');

    const attendanceRecords = await Attendance.find({
      date: normalizedDate
    });

    const attendanceMap = {};
    attendanceRecords.forEach(a => {
      attendanceMap[a.userId.toString()] = a.status;
    });

    const result = users.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      status: attendanceMap[user._id.toString()] || 'Absent'
    }));

    res.json(result);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch daily attendance' });
  }
}