import { Modal, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import { showSuccess, showError } from "../toast/toast";
import requestApi from "../../components/utils/axios";

const AddUserModal = ({ open, onCancel, locations, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) form.resetFields();
  }, [open]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await requestApi("POST", "/attendance/staffs", values);
      setLoading(false);
      if (res.success) {
        showSuccess("User added successfully");
        onCancel();
        if (onSuccess) onSuccess();
      } else {
        showError(res.error?.error || "Failed to add user");
      }
    } catch (err) {
      setLoading(false);
      // Validation error
    }
  };

  return (
    <Modal
      title="Add User"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Create"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="contact"
          label="Contact"
          rules={[{ required: true, message: "Please enter contact" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="location"
          label="Location"
          rules={[{ required: true, message: "Please select location" }]}
        >
          <Select placeholder="Select location">
            {locations.map((loc) => (
              <Select.Option key={loc._id} value={loc._id}>
                {loc.location}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;
