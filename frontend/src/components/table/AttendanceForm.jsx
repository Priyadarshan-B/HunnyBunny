import {
  Button,
  DatePicker,
  Select,
  Table,
  Card,
  Input,
  Modal,
  Form,
  TimePicker,
  Space,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import requestApi from "../../components/utils/axios";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import { showError, showSuccess } from "../toast/toast";
import { UserAddOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import AddUserModal from "./AddUserModal";

const AttendanceForm = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(dayjs());
  const [originalAttendance, setOriginalAttendance] = useState({});
  const [search, setSearch] = useState("");
  const [addUserModal, setAddUserModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [editingTimes, setEditingTimes] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsersByDate(date);
    fetchLocations();
  }, [date]);

  const fetchUsersByDate = async (selectedDate) => {
    try {
      const dateStr = selectedDate.format("YYYY-MM-DD");
      const res = await requestApi("GET", `/attendance/staffs?date=${dateStr}`);
      const defaultAttendance = {};
      res.data.forEach((u) => {
        defaultAttendance[u._id] = u.status || "Absent";
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
      setAttendance(defaultAttendance);
      setOriginalAttendance(defaultAttendance);
    } catch {
      showError("Failed to load users");
    }
  };

  const fetchLocations = async () => {
    const res = await requestApi("GET", "/auth/location");
    if (res.success) setLocations(res.data);
  };

  const handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(searchValue) ||
        (u.contact || "").toLowerCase().includes(searchValue)
    );
    setFilteredUsers(filtered);
  };

  const debouncedSearch = useMemo(() => debounce(handleSearch, 300), [users]);

  const handleStatusChange = (userId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  const handleRowSubmit = async (userId) => {
    const dateStr = date.format("YYYY-MM-DD");
    try {
      const payload = {
        userId,
        date: dateStr,
        status: attendance[userId],
      };
      if (attendance[userId] === "Present") {
        payload.inTime = dayjs().toISOString();
      }
      await requestApi("POST", "/attendance/daily", payload);
      fetchUsersByDate(date);
      showSuccess("Attendance Updated");
    } catch {
      showError("Failed to Update Attendance");
    }
  };

  // Add User Modal logic
  const openAddUserModal = () => {
    setAddUserModal(true);
  };

  // Edit inTime/outTime logic
  const handleEditTimes = (user) => {
    setEditingRow(user._id);
    setEditingTimes({
      inTime: user.inTime !== "--" ? dayjs(user.inTime) : dayjs(),
      outTime: user.outTime !== "--" ? dayjs(user.outTime) : dayjs(),
    });
  };
  const handleSaveTimes = async (user) => {
    const dateStr = date.format("YYYY-MM-DD");
    // Validation: inTime must be before outTime
    if (
      editingTimes.inTime &&
      editingTimes.outTime &&
      editingTimes.inTime.isAfter(editingTimes.outTime)
    ) {
      showError("In Time should be before Out Time");
      return;
    }
    try {
      const payload = {
        userId: user._id,
        date: dateStr,
        inTime: editingTimes.inTime
          ? editingTimes.inTime.toISOString()
          : undefined,
        outTime: editingTimes.outTime
          ? editingTimes.outTime.toISOString()
          : undefined,
      };
      const res = await requestApi("PATCH", "/attendance/daily", payload);
      if (res.success) {
        showSuccess("Times updated");
        setEditingRow(null);
        fetchUsersByDate(date);
      } else {
        showError(res.error?.error || "Failed to update times");
      }
    } catch {
      showError("Failed to update times");
    }
  };

  const columns = [
    {
      title: "Staff Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Select
          value={attendance[record._id] || "Absent"}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record._id, value)}
          options={[
            { label: "Present", value: "Present" },
            { label: "Absent", value: "Absent" },
          ]}
        />
      ),
    },
    {
      title: "In Time",
      key: "inTime",
      render: (_, record) =>
        editingRow === record._id ? (
          <TimePicker
            value={editingTimes.inTime}
            onChange={(t) =>
              setEditingTimes((prev) => ({ ...prev, inTime: t }))
            }
            format="HH:mm"
          />
        ) : record.inTime !== "--" ? (
          dayjs(record.inTime).format("HH:mm")
        ) : (
          "--"
        ),
    },
    {
      title: "Out Time",
      key: "outTime",
      render: (_, record) =>
        editingRow === record._id ? (
          <TimePicker
            value={editingTimes.outTime}
            onChange={(t) =>
              setEditingTimes((prev) => ({ ...prev, outTime: t }))
            }
            format="HH:mm"
          />
        ) : record.outTime !== "--" ? (
          dayjs(record.outTime).format("HH:mm")
        ) : (
          "--"
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const current = attendance[record._id];
        const original = originalAttendance[record._id];
        const isChanged = current !== original;
        return (
          <Space>
            <Button
              type="primary"
              disabled={!isChanged}
              onClick={() => handleRowSubmit(record._id)}
            >
              Submit
            </Button>
            {record.inTime !== "--" || record.outTime !== "--" ? (
              editingRow === record._id ? (
                <Button
                  icon={<SaveOutlined />}
                  onClick={() => handleSaveTimes(record)}
                  type="dashed"
                >
                  Save
                </Button>
              ) : (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEditTimes(record)}
                  type="dashed"
                >
                  Edit
                </Button>
              )
            ) : null}
          </Space>
        );
      },
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Mark Attendance</h3>
          <Space>
            <Button
              icon={<UserAddOutlined />}
              type="primary"
              onClick={openAddUserModal}
            >
              Add User
            </Button>
            <Button type="default" onClick={() => navigate("/attendance")}>
              ← Back
            </Button>
          </Space>
        </div>
        <DatePicker
          value={date}
          onChange={(d) => setDate(d)}
          className="w-52"
        />
        <Input
          placeholder="Search by name or contact"
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-64"
          allowClear
        />
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredUsers}
          pagination={false}
        />
      </div>
      <AddUserModal
        open={addUserModal}
        onCancel={() => setAddUserModal(false)}
        locations={locations}
        onSuccess={() => fetchUsersByDate(date)}
      />
    </Card>
  );
};

export default AttendanceForm;
