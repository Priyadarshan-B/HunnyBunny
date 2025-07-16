const User = require("../../models/User");
const Role = require("../../models/Role");
const Attendance = require("../../models/Attendance");
const Contact = require("../../models/Contact");

exports.get_users = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    // Fetch all contacts
    const contacts = await Contact.find({});

    const attendanceRecords = await Attendance.find({
      date: normalizedDate,
    });

    const attendanceMap = {};
    attendanceRecords.forEach((a) => {
      attendanceMap[a.userId.toString()] = a;
    });

    const usersWithStatus = contacts.map((contact) => {
      const attendance = attendanceMap[contact._id.toString()];
      return {
        _id: contact._id,
        name: contact.name,
        contact: contact.contact,
        location: contact.location,
        status: attendance?.status || "Absent",
        inTime: attendance?.inTime ? attendance.inTime : "--",
        outTime: attendance?.outTime ? attendance.outTime : "--",
      };
    });

    res.json(usersWithStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users with attendance" });
  }
};

exports.post_attendance = async (req, res) => {
  const { userId, date, status, inTime, outTime } = req.body;
  try {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    let update = {};
    if (status) update.status = status;
    if (inTime) update.inTime = inTime;
    if (outTime) update.outTime = outTime;

    // If only outTime is provided, update only if record exists
    if (outTime && !inTime && !status) {
      const attendance = await Attendance.findOneAndUpdate(
        { userId, date: normalizedDate },
        { $set: { outTime } },
        { new: true }
      );
      if (!attendance) {
        return res
          .status(404)
          .json({ error: "Attendance record not found for outTime update" });
      }
      return res.json(attendance);
    }

    // Otherwise, upsert (create or update)
    const attendance = await Attendance.findOneAndUpdate(
      { userId, date: normalizedDate },
      { $set: update },
      { upsert: true, new: true }
    );

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: "Failed to save attendance" });
  }
};

exports.update_attendance = async (req, res) => {
  const { userId, date, inTime, outTime } = req.body;
  try {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const update = {};
    if (inTime) update.inTime = inTime;
    if (outTime) update.outTime = outTime;

    const attendance = await Attendance.findOneAndUpdate(
      { userId, date: normalizedDate },
      { $set: update },
      { new: true }
    );
    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: "Failed to update attendance times" });
  }
};

exports.get_attendance = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date is required" });

  try {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    // Fetch all contacts
    const contacts = await Contact.find({});
    const attendanceRecords = await Attendance.find({ date: normalizedDate });
    const attendanceMap = {};
    attendanceRecords.forEach((a) => {
      attendanceMap[a.userId.toString()] = a;
    });

    const result = contacts.map((contact) => {
      const attendance = attendanceMap[contact._id.toString()];
      return {
        _id: contact._id,
        name: contact.name,
        contact: contact.contact,
        location: contact.location,
        status: attendance?.status || "Absent",
        inTime: attendance?.inTime ? attendance.inTime : "--",
        outTime: attendance?.outTime ? attendance.outTime : "--",
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to fetch daily attendance" });
  }
};

exports.create_contact = async (req, res) => {
  try {
    const { name, contact, location } = req.body;
    if (!name || !contact || !location) {
      return res
        .status(400)
        .json({ error: "Name, contact, and location are required" });
    }
    // Validate location exists
    const Location = require("../../models/Location");
    const locationDoc = await Location.findById(location);
    if (!locationDoc) {
      return res.status(400).json({ error: "Invalid location" });
    }
    const Contact = require("../../models/Contact");
    const newContact = new Contact({ name, contact, location });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create contact", details: err.message });
  }
};

exports.update_contact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, location } = req.body;
    if (!id) return res.status(400).json({ error: "User ID is required" });
    const update = {};
    if (name) update.name = name;
    if (contact) update.contact = contact;
    if (location) update.location = location;
    const updated = await Contact.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.status(200).json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update user", details: err.message });
  }
};

exports.delete_contact = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "User ID is required" });
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete user", details: err.message });
  }
};
