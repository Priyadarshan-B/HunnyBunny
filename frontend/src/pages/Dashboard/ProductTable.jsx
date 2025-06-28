import React, { useState } from "react";
import { Table, Input, Typography, Pagination, Select, Empty } from "antd";

const { Search } = Input;
const { Title } = Typography;
const { Option } = Select;

function ProductTable({
  products = [],
  page,
  total,
  pageSize,
  onPageChange
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    {
      title: <strong>Code</strong>,
      dataIndex: "code",
      key: "code",
    },
    {
      title: <strong>Name</strong>,
      dataIndex: "name",
      key: "name",
    },
    {
      title: <strong>Price</strong>,
      dataIndex: "price",
      key: "price",
      render: (price) => `₹ ${Number(price).toFixed(2)}`,
    },
    {
      title: <strong>Stock</strong>,
      dataIndex: "product_quantity",
      key: "stock",
    },
  ];

  return (
    <div className="bg-[var(--background-1)] text-[var(--text)] mt-3 p-4 rounded-xl flex-2 w-full">
      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="!m-0 !text-[var(--text)]">
          All Products
        </Title>
        <Search
          placeholder="Search by name or code"
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onPageChange(1, pageSize); 
          }}
          allowClear
          className="w-64"
        />
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey={(record) => record._id || record.code}
        pagination={false}
        locale={{
          emptyText: <Empty description="No Products data available" />,
        }}
      />

      <div className="flex justify-between items-center mt-4">
        <Pagination
          current={page}
          total={total}
          pageSize={pageSize}
          onChange={(p, ps) => onPageChange(p, ps)}
          showSizeChanger
          pageSizeOptions={["5", "10", "15", "25", "50"]}
        />
      </div>
    </div>
  );
}

export default ProductTable;
