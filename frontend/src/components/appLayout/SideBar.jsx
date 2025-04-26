import React, { useState, useEffect, useRef } from "react";
import "./Layout.css";
import { Link, useLocation } from "react-router-dom";
import RecyclingSharpIcon from '@mui/icons-material/RecyclingSharp';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

function getIconComponent(iconPath, isActive) {
    const iconColor = isActive ? '#ffffff' : '#616773'; // White if active
    switch (iconPath) {
        case 'DashboardIcon':
            return <DashboardIcon style={{ color: iconColor }} className="custom-sidebar-icon" />;
        case 'AutoStoriesIcon':
            return <QrCodeScannerIcon style={{ color: iconColor }} className="custom-sidebar-icon" />;
        case 'RecyclingSharpIcon':
            return <HistoryIcon style={{ color: iconColor }} className="custom-sidebar-icon" />;
        case 'ScheduleSendIcon':
            return <ScheduleSendIcon style={{ color: iconColor }} className="custom-sidebar-icon" />;
        default:
            return null;
    }
}

function SideBar(props) {
    const [activeItem, setActiveItem] = useState("");
    const [sidebarSections, setSidebarSections] = useState([]);
    const [userDetailsOpen, setUserDetailsOpen] = useState(false);
    const location = useLocation();
    const sidebarRef = useRef(null);

    const dummyUsername = "jothshana";
    const firstLetter = dummyUsername.charAt(0).toUpperCase();
    const displayUsername = dummyUsername.charAt(0).toUpperCase() + dummyUsername.slice(1);

    useEffect(() => {
        const dummySidebarSections = [
            {
                heading: "Dashboard",
                items: [
                    { path: "/dashboard", name: "Dashboard", icon_path: "DashboardIcon" },
                    { path: "/scan", name: "Scan Products", icon_path: "AutoStoriesIcon" }
                ]
            },
            {
                heading: "History",
                items: [
                    { path: "/history", name: "Order History", icon_path: "RecyclingSharpIcon" },
                    { path: "/dummy", name: "Dummy", icon_path: "ScheduleSendIcon" }
                ]
            }
        ];
        setSidebarSections(dummySidebarSections);
    }, []);

    useEffect(() => {
        const pathname = location.pathname;
        sidebarSections.forEach(section => {
            section.items.forEach(item => {
                if (pathname.startsWith(item.path)) {
                    setActiveItem(item.name);
                }
            });
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
        setUserDetailsOpen(prev => !prev);
    };

    return (
        <div ref={sidebarRef} className={props.open ? "app-sidebar sidebar-open" : "app-sidebar"}>
            {/* USER SECTION */}
            <div
                style={{
                    border: "1px solid #222632",
                    marginTop: "15px",
                    padding: "7px",
                    borderRadius: "5px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ backgroundColor: "#ff7d67", padding: "5px 13px", borderRadius: "5px" }}>
                            {firstLetter}
                        </div>
                        <div>{displayUsername}</div>
                    </div>
                    <div onClick={toggleUserDetails} style={{ cursor: "pointer" }}>
                        {userDetailsOpen ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                    </div>
                </div>

                {userDetailsOpen && (
                    <div style={{ marginTop: "2px", paddingLeft: "5px", fontSize: "14px", color: "#bbb" }}>
                        <hr color="#222632" />
                        <p><b>Email :</b> username@example.com</p>
                        <p><b>Role :</b> Admin</p>
                        <p><b>Location :</b> Chennai</p>
                    </div>
                )}
            </div>

            {/* SIDEBAR SECTIONS */}
            {sidebarSections.map((section, index) => (
                <div key={index}>
                    <p style={{ paddingTop: "15px", color: "gray", fontSize: "14px", fontWeight: "bold" }}>{section.heading}</p>
                    <ul className="list-div">
                        {section.items.map(item => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <li
                                    key={item.path}
                                    className={`list-items ${isActive ? "active" : ""}`}
                                    onClick={() => { setActiveItem(item.name); props.handleSideBar(); }}
                                >
                                    <Link className="link" to={item.path}>
                                        {getIconComponent(item.icon_path, isActive)}
                                        <p className="menu-names">{item.name}</p>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default SideBar;
