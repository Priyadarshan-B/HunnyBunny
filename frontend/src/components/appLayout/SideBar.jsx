import React, { useState, useEffect, useRef } from "react";
import "./Layout.css";
import { Link, useLocation } from "react-router-dom";
import RecyclingSharpIcon from '@mui/icons-material/RecyclingSharp';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import HistoryIcon from '@mui/icons-material/History';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

function getIconComponent(iconPath, isActive) {
    const iconColor = isActive ? '#ffffff' : '#616773'; // White if active
    switch (iconPath) {
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
    const [sidebarItems, setSidebarItems] = useState([]);
    const [userDetailsOpen, setUserDetailsOpen] = useState(false);
    const location = useLocation();
    const sidebarRef = useRef(null);

    const dummyUsername = "jothshana";
    const firstLetter = dummyUsername.charAt(0).toUpperCase();
    const displayUsername = dummyUsername.charAt(0).toUpperCase() + dummyUsername.slice(1);

    useEffect(() => {
        const dummySidebarItems = [
            { path: "/scan", name: "Scan Products", icon_path: "AutoStoriesIcon" },
            { path: "/history", name: "Order History", icon_path: "RecyclingSharpIcon" },
            { path: "/dummy", name: "Dummy", icon_path: "ScheduleSendIcon" },
        ];
        setSidebarItems(dummySidebarItems);
    }, []);

    useEffect(() => {
        const pathname = location.pathname;
        if (pathname.startsWith("/materials/levels")) {
            setActiveItem("Subjects");
        } else {
            const activeItem = sidebarItems.find(item => item.path === pathname);
            if (activeItem) {
                setActiveItem(activeItem.name);
            }
        }
    }, [location, sidebarItems]);

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

                {/* USER DETAILS SECTION */}
                {userDetailsOpen && (
                    <div style={{ marginTop: "2px", paddingLeft: "5px", fontSize: "14px", color: "#bbb" }}>
                        <hr color="#222632" />
                        <p><b>Email :</b> username@example.com</p>
                        <p><b>Role :</b> Admin</p>
                        <p><b>Location :</b> Chennai</p>
                    </div>
                )}
            </div>

            <p style={{ paddingTop: "10px", color: "gray", fontSize: "14px", fontWeight: "bold" }}>General</p>
            <ul className="list-div">
                {sidebarItems.map(item => {
                    const isActive = location.pathname.startsWith(item.path) || (item.path === "/materials/subjects" && location.pathname.startsWith("/materials/levels"));
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
    );
}

export default SideBar;
