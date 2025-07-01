import { Table, Tag, Input } from "antd";
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";

const AttendanceTable = ({ data }) => {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (!search) {
      setFilteredData(data);
    } else {
      const lower = search.toLowerCase();
      const filtered = data.filter((item) =>
        item.username.toLowerCase().includes(lower)
      );
      setFilteredData(filtered);
    }
  }, [search, data]);

  const handleSearch = useMemo(
    () =>
      debounce((value) => {
        setSearch(value);
      }, 300),
    []
  );

  const columns = [
    {
      title: "Name",
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
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Present" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search by name"
        onChange={(e) => handleSearch(e.target.value)}
        allowClear
        style={{ width: 250 }}
      />

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredData}
        pagination={false}
      />
    </div>
  );
};

export default AttendanceTable;
