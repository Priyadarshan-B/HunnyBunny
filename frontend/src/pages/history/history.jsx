import React, { useEffect, useState } from "react";
import {
  Collapse,
  Table,
  Input,
  Typography,
  Pagination,
  Empty,
  Space,
  Card,
} from "antd";
import { jwtDecode } from "jwt-decode";
import requestApi from "../../components/utils/axios";
import dayjs from "dayjs";

const { Panel } = Collapse;

const History = () => {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 5;
  const [location, setLocation] = useState("");
  const [totalBills, setTotalBills] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("D!");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setLocation(decoded?.location || "");
      } catch (err) {
        console.error("Invalid token for decoding:", err);
      }
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (!location) return;

    const fetchBills = async () => {
      try {
        let url = `/bills/bill-details?page=${currentPage}&limit=${billsPerPage}&location=${encodeURIComponent(location)}`;
        if (debouncedSearch) {
          url += `&name=${encodeURIComponent(debouncedSearch)}`;
        }

        const response = await requestApi("GET", url);
        setBills(response.data.data || []);
        setTotalBills(response.data.total || 0);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setBills([]);
        setTotalBills(0);
      }
    };

    fetchBills();
  }, [debouncedSearch, location, currentPage]);

  const renderItemsTable = (items = []) => {
    return (
      <Table
        dataSource={items.map((item, idx) => ({
          key: idx,
          name: item.product_name,
          qty: item.quantity,
          price: item.unit_price,
          subtotal: (item.unit_price * item.quantity).toFixed(2),
        }))}
        pagination={false}
        size="small"
        bordered
        columns={[
          {
            title: "Product Name",
            dataIndex: "name",
          },
          {
            title: "Quantity",
            dataIndex: "qty",
            align: "right",
          },
          {
            title: "Unit Price",
            dataIndex: "price",
            align: "right",
            render: (text) => `₹${text}`,
          },
          {
            title: "Subtotal",
            dataIndex: "subtotal",
            align: "right",
            render: (text) => `₹${text}`,
          },
        ]}
        style={{ marginTop: 10 }}
      />
    );
  };

  return (
    <Card style={{ backgroundColor: "var(--background-1)" }}>
      <Typography.Title level={4} style={{ color: "var(--text)" }}>
        Customer Bills
      </Typography.Title>

      <Input
        placeholder="Search by customer name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: 300, marginBottom: 16 }}
      />

      {bills.length === 0 ? (
        <Empty description="No bills found" style={{ marginTop: 40 }} />
      ) : (
        <Collapse
          accordion
          style={{ backgroundColor: "var(--background-1)" }}
        >
          {bills.map((bill) => {
            const total = (bill.items || []).reduce(
              (sum, item) => sum + item.quantity * item.unit_price,
              0
            );
            return (
              <Panel
                header={
                  <Space direction="vertical">
                    <Typography.Text style={{ fontWeight: 600 }}>
                      Bill #{bill.bill_number} - {bill.customer_name}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      Payment: {bill.payment_method} | Date: {" "}
                      {dayjs(bill.date).format("DD MMM YYYY, hh:mm A")}
                    </Typography.Text>
                    <Typography.Text strong>
                      Total: ₹{total.toFixed(2)}
                    </Typography.Text>
                  </Space>
                }
                key={bill.bill_id}
                style={{ backgroundColor: "var(--background-1)" }}
              >
                {renderItemsTable(bill.items)}
              </Panel>
            );
          })}
        </Collapse>
      )}

      {totalBills > billsPerPage && (
        <Pagination
          style={{ marginTop: 20, textAlign: "center" }}
          current={currentPage}
          total={totalBills}
          pageSize={billsPerPage}
          onChange={(page) => setCurrentPage(page)}
        />
      )}
    </Card>
  );
};

export default History;
