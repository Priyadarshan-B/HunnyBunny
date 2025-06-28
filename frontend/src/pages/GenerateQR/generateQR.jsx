import React, { useState, useRef, useEffect } from "react";
import { Input, InputNumber, Button, Form } from "antd";
import { QRCodeCanvas } from "qrcode.react";
import requestApi from "../../components/utils/axios";
import "./generateQR.css";
import { showSuccess, showError, showWarning } from "../../components/toast/toast";
import { jwtDecode } from "jwt-decode";

export default function QRForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [qrId, setQrId] = useState(null);
  const [isQRGenerated, setIsQRGenerated] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("D!");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserLocation(decoded?.location);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  const handleGenerateQR = async () => {
    try {
      const values = await form.validateFields();
      const productId = values.product_id;
      setQrId(productId);
      setIsQRGenerated(true);
    } catch {
      showWarning("Please fill all required fields before generating QR.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();

      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) {
        showError("QR code not found.");
        return;
      }

      const dataUrl = canvas.toDataURL();
      const blob = await (await fetch(dataUrl)).blob();

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("price", values.price);
      formData.append("quantity", values.quantity);
      formData.append("qr_image", blob, `${values.product_id}.png`);
      formData.append("product_id", values.product_id);
      formData.append("location", userLocation);

      await requestApi("POST", "/products/qr_products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess("Product saved successfully!");
      form.resetFields();
      setIsQRGenerated(false);
      setQrId(null);
    } catch (err) {
      console.error(err);
      showError("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWithoutQR = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();

      const payload = {
        product_id: values.product_id,
        name: values.name,
        price: values.price,
        quantity: values.quantity,
        location: userLocation,
      };

      await requestApi("POST", "/products/qr_products", payload);

      showSuccess("Product saved without QR code!");
      form.resetFields();
      setIsQRGenerated(false);
      setQrId(null);
    } catch (err) {
      console.error(err);
      showError("Failed to save product without QR.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6 rounded bg-white [background-color:var(--background)]">
      <h2 className="text-2xl font-semibold mb-6">Add Bakery Product</h2>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Box - Form and Generate QR */}
        <div className="flex-1 border border-[var(--border-color)] rounded p-6 shadow-md [background-color:var(--background-1)]">
          <Form form={form} layout="vertical">
            <Form.Item
              name="product_id"
              label={<span className="custom-label">Product ID</span>}
              rules={[{ required: true }]}
            >
              <Input
                className="border border-[var(--border-color)]"
                style={{ backgroundColor: "var(--document)", color: "var(--text)" }}
                placeholder="Enter unique Product ID"
              />
            </Form.Item>

            <Form.Item
              name="name"
              label={<span className="custom-label">Product Name</span>}
              rules={[{ required: true }]}
            >
              <Input
                className="border border-[var(--border-color)]"
                style={{ backgroundColor: "var(--document)", color: "var(--text)" }}
                placeholder="e.g. Cinnamon Roll"
              />
            </Form.Item>

            <Form.Item
              name="price"
              label={<span className="custom-label">Price</span>}
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ backgroundColor: "var(--document)" }}
                min={0}
                step={0.01}
                className="w-full border border-[var(--border-color)] text-[var(--text)]"
                prefix="₹"
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              label={<span className="custom-label">Quantity</span>}
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ backgroundColor: "var(--document)" }}
                min={1}
                className="w-full border border-[var(--border-color)] text-[var(--text)]"
              />
            </Form.Item>

            <div className="flex gap-2 mt-2 float-right">
              <Button
                style={{ backgroundColor: "#635bff", color: "white", border: "none" }}
                type="default"
                onClick={handleGenerateQR}
              >
                Generate QR
              </Button>

              {/* <Button
                style={{ backgroundColor: "#2196f3", color: "white", border: "none" }}
                type="default"
                onClick={handleSaveWithoutQR}
                loading={loading}
              >
                Save without QR
              </Button> */}
            </div>
          </Form>
        </div>

        {/* Right Box - QR Code and Save */}
        <div className="flex-1 border border-[var(--border-color)] rounded p-6 shadow-md [background-color:var(--background-1)] flex flex-col items-center justify-center">
          {qrId ? (
            <div ref={qrRef} className="text-center">
              <QRCodeCanvas
                style={{ padding: "10px", backgroundColor: "white" }}
                value={qrId}
                size={160}
              />
              <p className="mt-2 text-sm text-gray-500">
                <strong>{qrId}</strong>
              </p>

              <Button
                style={{ backgroundColor: "green", color: "white", border: "none" }}
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={!isQRGenerated}
                className="mt-4 w-full"
              >
                Save Product
              </Button>
            </div>
          ) : (
            <p className="text-gray-400 text-center">Generate QR to preview here</p>
          )}
        </div>
      </div>
    </div>
  );
}
