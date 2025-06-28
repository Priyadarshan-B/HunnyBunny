import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  DatePicker,
  Typography,
  Empty,
  Pagination,
} from "antd";
import dayjs from "dayjs";
import requestApi from "../../components/utils/axios";

const { Title } = Typography;

const TodayProductSales = () => {
  const [date, setDate] = useState(dayjs());
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchSales(date.format("YYYY-MM-DD"));
    setPage(1);
  }, [date]);

  const fetchSales = async (selectedDate) => {
    try {
      setLoading(true);
      const res = await requestApi("GET", `/dashboard/tdy-products?date=${selectedDate}`);
      setSales(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch sales data", err);
    } finally {
      setLoading(false);
    }
  };

  const paginatedSales = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sales.slice(start, start + pageSize);
  }, [sales, page, pageSize]);

  const columns = [
    {
      title: <strong>Product Name</strong>,
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: <strong>Quantity</strong>,
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: <strong>Total Price</strong>,
      dataIndex: "total_price",
      key: "total_price",
      render: (price) => `₹ ${Number(price).toFixed(2)}`
    },
  ];

  return (
    <div className="bg-[var(--background-1)] mt-3 text-[var(--text)] p-4 rounded-xl flex-1 w-full min-h-[360px]">
      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="!text-[var(--text)] !mb-0">
          Sales Summary
        </Title>
        <DatePicker
          value={date}
          onChange={(val) => setDate(val || dayjs())}
          allowClear={false}
         
          style={{ minWidth: 120 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={paginatedSales}
        rowKey={(record, idx) => idx}
        loading={loading}
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={loading ? "Loading..." : "No sales data found"}
            />
          )
        }}
      />

      {sales.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <Pagination
            current={page}
            total={sales.length}
            pageSize={pageSize}
            showSizeChanger
            pageSizeOptions={["5", "10", "15"]}
            onChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TodayProductSales;
