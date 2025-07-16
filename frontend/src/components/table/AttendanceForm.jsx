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
  Popconfirm,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import requestApi from "../../components/utils/axios";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import { showError, showSuccess } from "../toast/toast";
import {
  UserAddOutlined,
  EditOutlined,
  SaveOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
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
  const [editUserModal, setEditUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editUserForm] = Form.useForm();
  const [editUserLoading, setEditUserLoading] = useState(false);

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

  // User update logic
  const handleEditUser = (user) => {
    setUserToEdit(user);
    setEditUserModal(true);
    setTimeout(() => {
      editUserForm.setFieldsValue({
        name: user.name,
        contact: user.contact,
        location: user.location,
      });
    }, 0);
  };
  const handleUpdateUser = async () => {
    try {
      const values = await editUserForm.validateFields();
      setEditUserLoading(true);
      const res = await requestApi(
        "PATCH",
        `/attendance/staffs/${userToEdit._id}`,
        values
      );
      setEditUserLoading(false);
      if (res.success) {
        showSuccess("User updated successfully");
        setEditUserModal(false);
        fetchUsersByDate(date);
      } else {
        showError(res.error?.error || "Failed to update user");
      }
    } catch (err) {
      setEditUserLoading(false);
    }
  };
  const handleDeleteUser = async (user) => {
    try {
      const res = await requestApi("DELETE", `/attendance/staffs/${user._id}`);
      if (res.success) {
        showSuccess("User deleted successfully");
        fetchUsersByDate(date);
      } else {
        showError(res.error?.error || "Failed to delete user");
      }
    } catch {
      showError("Failed to delete user");
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
            format="hh:mm A"
            use12Hours
          />
        ) : record.inTime !== "--" ? (
          dayjs(record.inTime).format("hh:mm A")
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
            format="hh:mm A"
            use12Hours
          />
        ) : record.outTime !== "--" ? (
          dayjs(record.outTime).format("hh:mm A")
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
                  Update
                </Button>
              ) : (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEditTimes(record)}
                  type="dashed"
                >
                  Edit Times
                </Button>
              )
            ) : null}
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
              type="default"
            />
            <Popconfirm
              title="Are you sure to delete this user?"
              onConfirm={() => handleDeleteUser(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} danger type="default" />
            </Popconfirm>
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
      <Modal
        title="Edit User"
        open={editUserModal}
        onCancel={() => setEditUserModal(false)}
        onOk={handleUpdateUser}
        okText="Update"
        confirmLoading={editUserLoading}
      >
        <Form form={editUserForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="contact"
            label="Contact"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select location">
              {locations.map((loc) => (
                <Select.Option key={loc._id} value={loc._id}>
                  {loc.location}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AttendanceForm;
