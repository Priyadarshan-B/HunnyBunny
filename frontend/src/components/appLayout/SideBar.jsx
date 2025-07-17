import React, { useState, useEffect, useRef } from "react";
import "./Layout.css";
import requestApi from "../utils/axios";
import { Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { encryptData, decryptData } from "../utils/encrypt";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import HistoryIcon from "@mui/icons-material/History";
import DashboardIcon from "@mui/icons-material/Dashboard";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import FormatListBulletedAddIcon from "@mui/icons-material/FormatListBulletedAdd";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HowToRegIcon from "@mui/icons-material/HowToReg";

function getIconComponent(iconPath, isActive) {
  const iconColor = isActive ? "#ffffff" : "#635bff";
  switch (iconPath) {
    case "DashboardIcon":
      return (
        <DashboardIcon
          style={{ color: iconColor }}
          className="custom-sidebar-icon"
        />
      );
    case "QrCodeScannerIcon":
      return (
        <QrCodeScannerIcon
          style={{ color: iconColor }}
          className="custom-sidebar-icon"
        />
      );
    case "HistoryIcon":
      return (
        <HistoryIcon
          style={{ color: iconColor }}
          className="custom-sidebar-icon"
        />
      );
    case "ScheduleSendIcon":
      return (
        <ScheduleSendIcon
          style={{ color: iconColor }}
          className="custom-sidebar-icon"
        />
      );
    case "FormatListBulletedAddIcon":
      return (
        <FormatListBulletedAddIcon
          style={{ color: iconColor }}
          className="custom-sidebar-icon"
        />
      );
    case "ShoppingCartIcon":
      return (
        <ShoppingCartIcon
          style={{ color: iconColor }}
          className="custom-sidebar-icon"
        />
      );
    case "HowToRegIcon":
      return (
        <HowToRegIcon
          style={{ color: iconColor }}
          className="custom-sidebar-icon"
        />
      );
    default:
      return null;
  }
}

function SideBar(props) {
  const [activeItem, setActiveItem] = useState("");
  const [sidebarSections, setSidebarSections] = useState([]);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const location = useLocation();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("D!");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo(decoded);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const fetchSidebarSections = async () => {
    const cacheKey = "sb";
    const encryptedData = sessionStorage.getItem(cacheKey);

    if (encryptedData) {
      const decrypted = decryptData(encryptedData);
      if (decrypted) {
        setSidebarSections(decrypted);
        return;
      }
    }

    try {
      const role = userInfo?.role || 2;
      const response = await requestApi("POST", "/auth/resources", { role });

      if (response?.data) {
        const encrypted = encryptData(response.data);
        sessionStorage.setItem(cacheKey, encrypted);
        setSidebarSections(response.data);
      } else {
        console.warn("No data received for sidebar sections.");
      }
    } catch (error) {
      console.error("Error fetching sidebar sections:", error);
    }
  };

  useEffect(() => {
    if (userInfo?.role) {
      fetchSidebarSections();
    }
  }, [userInfo]);

  useEffect(() => {
    const pathname = location.pathname;
    sidebarSections.forEach((item) => {
      if (pathname.startsWith(item.path)) {
        setActiveItem(item.name);
      }
    });
  }, [location, sidebarSections]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        props.handleSideBar();
      }
    };
    if (props.open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [props.open]);

  const toggleUserDetails = () => {
    setUserDetailsOpen((prev) => !prev);
  };

  const firstLetter = userInfo?.name?.charAt(0)?.toUpperCase() || "";
  const displayUsername = userInfo?.name || "User";

  return (
    <div
      ref={sidebarRef}
      className={props.open ? "app-sidebar sidebar-open" : "app-sidebar"}
    >
      <div
        style={{
          border: "1px solid var(--border-color)",
          marginTop: "15px",
          padding: "7px",
          borderRadius: "5px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          backgroundColor: "var(--document)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div
              style={{
                backgroundColor: "#ff7d67",
                padding: "5px 13px",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              {firstLetter}
            </div>
            <div>{displayUsername}</div>
          </div>
          <div onClick={toggleUserDetails} style={{ cursor: "pointer" }}>
            {userDetailsOpen ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
          </div>
        </div>

        {userDetailsOpen && (
          <div>
            <hr style={{ color: "red" }} />
            <div
              style={{
                marginTop: "2px",
                paddingLeft: "5px",
                fontSize: "14px",
                color: "var(--text)",
              }}
            >
              <p>
                <b>Email :</b> {userInfo?.email || "N/A"}
              </p>
              <p>
                <b>Role :</b> {userInfo?.role === 2 ? "Admin" : "User"}
              </p>
              <p>
                <b>Location :</b> {userInfo?.lname || "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SIDEBAR MENU */}
      <div>
        <ul className="list-div">
          {sidebarSections.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li
                key={item.path}
                className={`list-items ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveItem(item.name);
                  props.handleSideBar();
                }}
              >
                <Link className="link" to={item.path}>
                  {getIconComponent(item.icon, isActive)}
                  <p className="menu-names">{item.name}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default SideBar;
