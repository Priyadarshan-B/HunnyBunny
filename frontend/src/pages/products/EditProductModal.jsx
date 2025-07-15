// src/pages/products/EditProductModal.jsx

import React, { useState } from "react";
import {
  Modal,
  Select,
  DatePicker,
  Button,
  Space,
  Input,
  InputNumber,
} from "antd";
import dayjs from "dayjs";
import requestApi from "../../components/utils/axios";
import { showSuccess, showError } from "../../components/toast/toast";

const EditProductModal = ({
  visible,
  onClose,
  onSave,
  product,
  editState,
  setEditState,
  quantityOptions,
  refreshProducts,
}) => {
  const [formState, setFormState] = useState({
    name: product?.name || "",
    quantity: product?.product_quantity || 0,
    price: product?.price || 0,
  });
  const [loading, setLoading] = useState(false);
  const [savingState, setSavingState] = useState(false);

  React.useEffect(() => {
    setFormState({
      name: product?.name || "",
      quantity: product?.product_quantity || 0,
      price: product?.price || 0,
    });
  }, [product]);

  const handleQtyChange = (value) => {
    setEditState((prev) => ({ ...prev, qty: value }));
  };

  const handleDateChange = (type, _, dateString) => {
    setEditState((prev) => ({ ...prev, [type]: dateString }));
  };

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Save name, quantity, price (API, do not close modal)
  const handleSaveMain = async () => {
    if (!product?.id) return;
    setLoading(true);
    try {
      const res = await requestApi(
        "PUT",
        `/products/qr_products/${product.id}`,
        {
          name: formState.name,
          quantity: formState.quantity,
          price: formState.price,
        }
      );
      setLoading(false);
      if (res.success) {
        showSuccess("Product updated successfully");
        if (refreshProducts) refreshProducts();
        // Do not close modal
      } else {
        showError(res.error?.error || "Failed to update product");
      }
    } catch (err) {
      setLoading(false);
      showError("Failed to update product");
    }
  };

  // Save qty, pkd, exp (state only, close modal)
  const handleSaveState = () => {
    setSavingState(true);
    setTimeout(() => {
      setSavingState(false);
      onSave(); // This closes the modal
    }, 300); // Simulate async if needed
  };

  return (
    <Modal
      title={`Edit ${product?.name}`}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <label>Product Name</label>
          <Input
            placeholder="Product Name"
            value={formState.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Quantity</label>
            <InputNumber
              placeholder="Quantity"
              value={formState.quantity}
              min={0}
              style={{ width: "100%" }}
              onChange={(value) => handleInputChange("quantity", value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Price</label>
            <InputNumber
              placeholder="Price"
              value={formState.price}
              min={0}
              style={{ width: "100%" }}
              onChange={(value) => handleInputChange("price", value)}
            />
          </div>
        </div>
        <Button
          type="primary"
          onClick={handleSaveMain}
          loading={loading}
          style={{ width: "100%" }}
        >
          Save Name, Quantity, Price
        </Button>
        <div>
          <label>Quantity Option</label>
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
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Packed Date</label>
            <DatePicker
              placeholder="Packed Date"
              format="DD-MM-YYYY"
              value={editState.pkd ? dayjs(editState.pkd, "DD-MM-YYYY") : null}
              onChange={(d, ds) => handleDateChange("pkd", d, ds)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Expiry Date</label>
            <DatePicker
              placeholder="Expiry Date"
              format="DD-MM-YYYY"
              minDate={
                editState.pkd ? dayjs(editState.pkd, "DD-MM-YYYY") : null
              }
              value={editState.exp ? dayjs(editState.exp, "DD-MM-YYYY") : null}
              onChange={(d, ds) => handleDateChange("exp", d, ds)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <Button
          type="primary"
          onClick={handleSaveState}
          loading={savingState}
          style={{ width: "100%" }}
        >
          Save Qty, Packed, Expiry
        </Button>
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
        </div>
      </Space>
    </Modal>
  );
};

export default EditProductModal;
