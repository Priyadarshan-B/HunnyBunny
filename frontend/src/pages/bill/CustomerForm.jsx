import React from "react";
import { Input, Select } from "antd";

const { Option } = Select;

const CustomerForm = ({
  customerName,
  setCustomerName,
  paymentMethod,
  setPaymentMethod,

}) => (
  <div
    className="qr-form"
    style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
  >
    <div style={{ flex: 1, minWidth: "200px" }}>
      <label className="block mb-1 font-medium">Customer Name</label>
      <Input
        value={customerName}
        onChange={(e) =>
          setCustomerName(e.target.value)
        }
        placeholder="Enter customer name"
      />
    </div>

    <div style={{ flex: 1, minWidth: "200px" }}>
      <label className="block mb-1 font-medium">Payment Method</label>
      <Select
        value={paymentMethod}
        onChange={setPaymentMethod}
        placeholder="Select Payment"
        style={{ width: "100%" }}
      >
        <Option value="CASH">Cash</Option>
        <Option value="UPI">UPI</Option>
        <Option value="COD">Cash on Delivery</Option>
        <Option value="CARD">Card</Option>
      </Select>
    </div>
  </div>
);

export default CustomerForm;
