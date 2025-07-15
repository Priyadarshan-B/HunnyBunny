import { Table, Tag, Input } from "antd";
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import dayjs from "dayjs";

const AttendanceTable = ({ data }) => {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (!search) {
      setFilteredData(data);
    } else {
      const lower = search.toLowerCase();
      const filtered = data.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(lower) ||
          (item.contact || "").toLowerCase().includes(lower)
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
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Present" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "In Time",
      dataIndex: "inTime",
      key: "inTime",
      render: (inTime) =>
        inTime && inTime !== "--" ? dayjs(inTime).format("HH:mm") : "--",
    },
    {
      title: "Out Time",
      dataIndex: "outTime",
      key: "outTime",
      render: (outTime) =>
        outTime && outTime !== "--" ? dayjs(outTime).format("HH:mm") : "--",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search by name or contact"
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
