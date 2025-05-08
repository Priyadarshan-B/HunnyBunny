import React, { useState, useRef } from "react";
import { Input, InputNumber, Button, Form, message } from "antd";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import "./qrCode.css";

export default function QRForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);
  const [qrId, setQrId] = useState(null);
  const [isQRGenerated, setIsQRGenerated] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef(null);

  const handleGenerateQR = async () => {
    try {
      const values = await form.validateFields();
      const productId = values.product_id;
      setQrId(productId);
      setShowQR(true);
      setIsQRGenerated(true);
    } catch {
      message.warning("Please fill all required fields before generating QR.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) {
        message.error('QR code not found.');
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
      console.log(formData);
      console.log("Handle submit clicked");
      await axios.post("http://localhost:5000/products/qr_products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Product saved successfully!");
      form.resetFields();
      setIsQRGenerated(false);
      setQrPreview(null);
    } catch (err) {
      console.error(err);
      message.error("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 shadow-xl rounded-l bg-white space-y-6 [background-color:var(--background-1)]">
      <h2 className="text-2xl font-semibold text-center">Add Bakery Product</h2>

      <Form form={form} layout="vertical">
        <Form.Item
          name="product_id"
          label={<span className="custom-label">Product ID</span>}
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter unique Product ID" />
        </Form.Item>

        <Form.Item
          name="name"
          label={<span className="custom-label">Product Name</span>}
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g. Cinnamon Roll" />
        </Form.Item>

        <Form.Item name="price" label={<span className="custom-label">Price</span>} rules={[{ required: true }]}>
          <InputNumber min={0} step={0.01} className="w-full" prefix="₹" />
        </Form.Item>

        <Form.Item
          name="quantity"
          label={<span className="custom-label">Quantity</span>}
          rules={[{ required: true }]}
        >
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <div className="flex gap-4">
          <Button type="default" onClick={handleGenerateQR} className="flex-1">
            Generate QR
          </Button>

          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={!isQRGenerated}
            className="flex-1"
          >
            Save Product
          </Button>
        </div>
      </Form>

      {qrId && (
        <div className="flex flex-col items-center mt-6" ref={qrRef}>
          <QRCodeCanvas value={qrId} size={128} />
          <p className="mt-2 text-gray-500 text-sm">
            QR code for Product ID: {qrId}
          </p>
        </div>
      )}
    </div>
  );
}
