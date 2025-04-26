import React, { useState, useEffect, useRef } from "react";
import "./Layout.css";
import { Link, useLocation } from "react-router-dom";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import RecyclingSharpIcon from '@mui/icons-material/RecyclingSharp';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';

function getIconComponent(iconPath) {
    switch (iconPath) {
        case 'AutoStoriesIcon':
            return <AutoStoriesIcon style={{ color: '#2ecc71' }} className="custom-sidebar-icon" />;
        case 'RecyclingSharpIcon':
            return <RecyclingSharpIcon style={{ color: '#e74c3c' }} className="custom-sidebar-icon1" />;
        case 'ScheduleSendIcon':
            return <ScheduleSendIcon style={{ color: '#f1c40f' }} className="custom-sidebar-icon2" />;
        default:
            return null;
    }
}

function SideBar(props) {
    const [activeItem, setActiveItem] = useState("");
    const [sidebarItems, setSidebarItems] = useState([]);
    const location = useLocation();
    const sidebarRef = useRef(null);

    useEffect(() => {
        // Dummy data instead of API call
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

    return (
        <div ref={sidebarRef} className={props.open ? "app-sidebar sidebar-open" : "app-sidebar"}>
            <ul className="list-div">
                {sidebarItems.map(item => (
                    <li
                        key={item.path}
                        className={`list-items ${location.pathname.startsWith(item.path) || (item.path === "/materials/subjects" && location.pathname.startsWith("/materials/levels")) ? "active" : ""}`}
                        onClick={() => { setActiveItem(item.name); props.handleSideBar(); }}
                    >
                        <Link className="link" to={item.path}>
                            {getIconComponent(item.icon_path)}
                            <p className="menu-names">{item.name}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SideBar;
