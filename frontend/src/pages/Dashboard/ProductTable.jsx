import React, { useEffect, useState } from "react";
import { Table, Input, Typography, Pagination, Select, Empty, message } from "antd";
import requestApi from "../../components/utils/axios";

const { Search } = Input;
const { Title } = Typography;
const { Option } = Select;

const ITEMS_PER_PAGE = 5;

function ProductTable() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts(page, pageSize, searchTerm);
  }, [page, pageSize, searchTerm]);

  const fetchProducts = async (page, limit, search = "") => {
    try {
      setLoading(true);
      const url = `/products/qr_products?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
      const res = await requestApi("GET", url);
      const safeData = Array.isArray(res.data.data) ? res.data.data : [];
      setProducts(safeData);
      setTotal(res.data.total || 0);
    } catch {
      setProducts([]);
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

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
            setPage(1);
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
        loading={loading}
        locale={{
          emptyText: <Empty description="No Products data available" />,
        }}
      />

      <div className="flex justify-between items-center mt-4">
        <Pagination
          current={page}
          total={total}
          pageSize={pageSize}
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
          showSizeChanger
          pageSizeOptions={["5", "10", "15", "25", "50"]}
        />
      </div>
    </div>
  );
}

export default ProductTable;
