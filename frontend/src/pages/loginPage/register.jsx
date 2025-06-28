import React, { useState, useEffect } from "react";
import "./loginPage.css";
import { useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Input, Button, Form, Select, message } from "antd";
import CustomizedSwitches from "../../components/appLayout/theme/toggleTheme";
import image from "../../assets/image.png";
import requestApi from "../../components/utils/axios";
import hunnybunny from "../../assets/hunnybunny.png";

const { Option } = Select;

function Register() {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const rolesRes = await requestApi("GET", "/auth/roles");
      const locationsRes = await requestApi("GET", "/auth/location");

      if (rolesRes.success) {
        setRoles(rolesRes.data);
      } else {
        message.error("Failed to load roles");
      }

      if (locationsRes.success) {
        setLocations(locationsRes.data);
      } else {
        message.error("Failed to load locations");
      }
    };
    fetchData();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    const { username, email, password, role, location } = values;

    const response = await requestApi("POST", "/auth/register", {
      username,
      email,
      password,
      role,
      location,
    });

    if (response.success) {
      message.success("Registration successful!");
      navigate("/login");
    } else {
      message.error(response.error?.message || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <p>
        <CustomizedSwitches />
      </p>
      <div className="overlay"></div>
      <div className="login-card">
        <div className="card-image-section">
          <img src={image} alt="Bakery inside" className="card-image" />
        </div>
        <div className="card-form-section">
          <center>
            <img className="hunnybunny" src={hunnybunny} alt="" />
            <p>Freshness at your fingertips!</p>
          </center>
          <Form name="register-form" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Enter a valid email!" },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[{ required: true, message: "Please select your role!" }]}
            >
              <Select placeholder="Select Role">
                {roles.map((role) => (
                  <Option key={role._id} value={role._id}>
                    {role.role}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="location"
              rules={[
                { required: true, message: "Please select your location!" },
              ]}
            >
              <Select placeholder="Select Location">
                {locations.map((loc) => (
                  <Option key={loc._id} value={loc._id}>
                    {loc.location}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                placeholder="Password"
                visibilityToggle={{
                  visible: passwordVisible,
                  onVisibleChange: setPasswordVisible,
                }}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="login-btn"
              >
                Register
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Register;
