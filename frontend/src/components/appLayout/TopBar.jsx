import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MenuOutlined,
  LogoutOutlined,
  BellOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Dropdown,
  Avatar,
  Modal,
  Typography,
  Badge,
  Button,
  Divider,
} from "antd";
import { jwtDecode } from "jwt-decode";
import ThemeToggleButton from "./theme/toggleThemeButton";
import logo from "../../assets/logo.png";

const { Header } = Layout;
const { Text, Paragraph } = Typography;

function TopBar(props) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: "", email: "", role: "" });
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);

  useEffect(() => {
    const token = localStorage.getItem("D!");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserData({
          name: decoded.name || "User",
          email: decoded.email || "Not available",
          role: decoded.role || "Not available",
        });
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  const firstLetter = userData.name.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("D!");
    sessionStorage.removeItem("sb");
    navigate("/login");
  };

  const userMenu = (
    <Menu>
      <Menu.Item disabled>
        <Text strong>{userData.name}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {userData.email}
        </Text>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        onClick={() => setLogoutModalVisible(true)}
        icon={<LogoutOutlined />}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        backgroundColor: "var(--background-1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 16px",
        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <MenuOutlined
          onClick={props.sidebar}
          className="show-on-mobile"
          style={{ fontSize: 20, color: "#7e57c2" }}
        />
        <img src={logo} alt="logo" style={{ height: 40 }} />
        <b className="hide-on-mobile">Hunny Bunny</b>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ThemeToggleButton />

        <Badge count={props.lowStockProducts?.length} size="small">
          <BellOutlined
            style={{ fontSize: 20, color: "#616773", cursor: "pointer" }}
            onClick={() => setNotificationModalVisible(true)}
          />
        </Badge>

        {userData.role === 2 && (
          <UserAddOutlined
            style={{ fontSize: 20, color: "#616773", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          />
        )}

        <Dropdown
          overlay={userMenu}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Avatar style={{ backgroundColor: "#0a6259", cursor: "pointer" }}>
            {firstLetter}
          </Avatar>
        </Dropdown>
      </div>

      {/* Logout Confirmation */}
      <Modal
        open={logoutModalVisible}
        title="Logout Confirmation"
        onCancel={() => setLogoutModalVisible(false)}
        onOk={() => handleLogout()}
        okText="Logout"
        cancelText="Cancel"
      >
        <p>Are you sure you want to logout?</p>
      </Modal>

      {/* Notification Modal */}
      <Modal
        open={notificationModalVisible}
        title="Notifications"
        onCancel={() => setNotificationModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setNotificationModalVisible(false)}
          >
            Close
          </Button>,
        ]}
      >
        {props.lowStockProducts?.length > 0 ? (
          props.lowStockProducts.map((prod, index) => (
            <React.Fragment key={index}>
              <div
                style={{
                  backgroundColor:
                    prod.product_quantity <= 5 ? "#ffe5e5" : "#fff8e1",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Text strong style={{ color: "#333" }}>
                  ⚠️ <b>{prod.name}</b> has only <b>{prod.product_quantity}</b>{" "}
                  left.
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Please restock as soon as possible.
                </Text>
              </div>
              {index < props.lowStockProducts.length - 1 && <Divider />}
            </React.Fragment>
          ))
        ) : (
          <Paragraph>You currently have no new notifications.</Paragraph>
        )}
      </Modal>
    </Header>
  );
}

export default TopBar;
