import { Button, DatePicker, Select, Table, Card, Input } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import requestApi from "../../components/utils/axios";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import { showError, showSuccess } from "../toast/toast";

const AttendanceForm = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(dayjs());
  const [originalAttendance, setOriginalAttendance] = useState({});
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsersByDate(date);
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
      // message.error("Failed to load users");
      showError("Failed to load users");
    }
  };

  const handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = users.filter((u) =>
      u.username.toLowerCase().includes(searchValue)
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
      await requestApi("POST", "/attendance/daily", {
        userId,
        date: dateStr,
        status: attendance[userId],
      });
      fetchUsersByDate(date);
      //   message.success(`Attendance saved for ${userId}`);
      showSuccess("Attendance Updated");
    } catch {
      //   message.error("Failed to save attendance");
      showError("Failed to Update Attendance");
    }
  };

  const columns = [
    {
      title: "Staff Name",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
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
      title: "Action",
      key: "action",
      render: (_, record) => {
        const current = attendance[record._id];
        const original = originalAttendance[record._id];
        const isChanged = current !== original;

        return (
          <Button
            type="primary"
            disabled={!isChanged}
            onClick={() => handleRowSubmit(record._id)}
          >
            Submit
          </Button>
        );
      },
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Mark Attendance</h3>
          <Button type="primary" onClick={() => navigate("/attendance")}>
            ← Back
          </Button>
        </div>
        <DatePicker
          value={date}
          onChange={(d) => setDate(d)}
          className="w-52"
        />

        <Input
          placeholder="Search by name"
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
    </Card>
  );
};

export default AttendanceForm;
