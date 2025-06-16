// src/pages/products/EditProductModal.jsx

import React from "react";
import { Modal, Select, DatePicker, Button, Space } from "antd";
import dayjs from "dayjs";

const EditProductModal = ({
  visible,
  onClose,
  onSave,
  product,
  editState,
  setEditState,
  quantityOptions,
}) => {
  const handleQtyChange = (value) => {
    setEditState((prev) => ({ ...prev, qty: value }));
  };

  const handleDateChange = (type, _, dateString) => {
    setEditState((prev) => ({ ...prev, [type]: dateString }));
  };

  return (
    <Modal
      title={`Edit ${product?.name}`}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Select
          showSearch
          placeholder="Select Quantity"
          value={editState.qty || null}
          onChange={handleQtyChange}
          options={quantityOptions}
          style={{ width: "100%" }}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        />
        <DatePicker
          placeholder="Packed Date"
          format="DD-MM-YYYY"
          value={editState.pkd ? dayjs(editState.pkd, "DD-MM-YYYY") : null}
          onChange={(d, ds) => handleDateChange("pkd", d, ds)}
          style={{ width: "100%" }}
        />
        <DatePicker
          placeholder="Expiry Date"
          format="DD-MM-YYYY"
          minDate={editState.pkd ? dayjs(editState.pkd, "DD-MM-YYYY") : null}
          value={editState.exp ? dayjs(editState.exp, "DD-MM-YYYY") : null}
          onChange={(d, ds) => handleDateChange("exp", d, ds)}
          style={{ width: "100%" }}
        />
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" onClick={onSave}>
            Save
          </Button>
        </div>
      </Space>
    </Modal>
  );
};

export default EditProductModal;
