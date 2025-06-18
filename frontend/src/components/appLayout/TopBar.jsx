import React, { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CustomizedSwitches from "./toggleTheme";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { Typography, Avatar, Box, styled, Divider} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { jwtDecode } from "jwt-decode";
import Badge from '@mui/material/Badge';

import image from "../../assets/image.png";
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import logo from "../../assets/logo.png";

// Styled Dialog
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function TopBar(props) {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
    const [userData, setUserData] = useState({ name: "", email: "", role: "" });

    useEffect(() => {
        const token = localStorage.getItem("D!");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserData({
                    name: decoded.name || "User",
                    email: decoded.email || "Not available",
                    role: decoded.role || "Not available"
                });
            } catch (err) {
                console.error("Invalid token", err);
            }
        }
    }, []);

    const firstLetter = userData.name.charAt(0).toUpperCase();
    const openMenu = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleLogoutClick = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/materials/login");
    };

    const confirmLogout = () => {
        handleLogout();
        handleCloseDialog();
    };

    const handleNotificationClick = () => {
        setNotificationDialogOpen(true);
    };

    const handleNotificationClose = () => {
        setNotificationDialogOpen(false);
    };

    return (
        <div
            className="app-topbar"
            style={{
                backgroundColor: "var(--background-1)",
                display: "flex",
                padding: "5px 12px",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                border: "1px solid var(--border-color)",
                boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
            }}
        >
            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div onClick={props.sidebar} className="sidebar-menu">
                        <MenuIcon style={{ color: "#7e57c2", margin: "0px 5px" }} />
                    </div>
                    <div className="app-name">
                        {/* <FastfoodIcon sx={{ color: "orange" }} /> */}
                        <img src={logo} alt="logo" style={{ height: "45px" }} />
                        <b>Hunny Bunny</b>
                    </div>
                </div>

                <div className="top-bar-menus" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CustomizedSwitches />

                    {/* <NotificationsActiveOutlinedIcon
                        sx={{ color: "#616773", fontSize: "22px", cursor: "pointer" }}
                        onClick={handleNotificationClick}
                    /> */}

                    <Badge badgeContent={props.lowStockProducts?.length} color="error">
                        <NotificationsActiveOutlinedIcon
                            sx={{ color: "#616773", fontSize: "22px", cursor: "pointer" }}
                            onClick={() => setNotificationDialogOpen(true)}
                        />
                    </Badge>


                    {userData.role === 2 && (
                        <PersonAddAltRoundedIcon
                            sx={{ color: "#616773", fontSize: "22px", cursor: "pointer", margin: "5px" }}
                            onClick={() => navigate("/register")}
                            titleAccess="Register"
                        />
                    )}

                    <div style={{ backgroundColor: "#0a6259", padding: "5px 13px", borderRadius: "100%", cursor: "pointer", fontWeight: "bold", color: "white" }} onClick={handleClick}>
                        {firstLetter}
                    </div>


                    <Menu
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleCloseMenu}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        sx={{
                            "& .MuiPaper-root": {
                                backgroundColor: "var(--background-1)",
                                border: "2px solid var(--border-color)",
                                width: "250px",
                                padding: "5px",
                            }
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                            <Typography
                                variant="p"
                                sx={{
                                    color: "var(--text)",
                                    margin: "5px",
                                    marginTop: "0px",
                                    position: "absolute",
                                    top: "0px",
                                    backgroundColor: "var(--document)",
                                    width: "100%",
                                    padding: "10px 0px 50px 0px",
                                    display: "flex",
                                    justifyContent: "center",
                                    zIndex: "2",
                                    borderRadius: "3px",
                                    fontWeight: "var(--f-weight)"
                                }}
                            >
                                {userData.name}
                            </Typography>
                            {/* <img
                                src={image}
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "50%",
                                    margin: "10px",
                                    zIndex: "3",
                                    marginTop: "30px",
                                    backgroundColor: "white"
                                }}
                                alt="profile"
                            /> */}
                            <div style={{
                                marginTop: "30px", width: "80px",
                                height: "80px", zIndex: "3", backgroundColor: "#ff7d67", padding: "5px 13px", borderRadius: "50px", fontSize: "40px", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text)"
                            }}>
                                {firstLetter}
                            </div>
                            <Typography variant="body2" sx={{ color: "var(--text)", fontWeight: "var(--f-weight)" }}>
                                {userData.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "var(--text)", marginBottom: "10px" }}>
                                {userData.email}
                            </Typography>
                        </Box>
                        <button className="logout-button" onClick={handleLogoutClick}>LOGOUT</button>
                    </Menu>
                </div>
            </div>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={openDialog}
                fullWidth
                onClose={handleCloseDialog}
                aria-labelledby="logout-dialog-title"
                aria-describedby="logout-dialog-description"
                sx={{ "& .MuiDialog-paper": { backgroundColor: "var(--background-1)", color: "var(--text)" } }}
            >
                <DialogTitle id="logout-dialog-title">Logout Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText id="logout-dialog-description" sx={{ color: "var(--text)" }}>
                        Are you sure you want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
                    <Button onClick={confirmLogout} color="primary" autoFocus>Logout</Button>
                </DialogActions>
            </Dialog>

            {/* Notifications Dialog */}
            <BootstrapDialog fullWidth
                onClose={handleNotificationClose}
                aria-labelledby="customized-dialog-title"
                open={notificationDialogOpen}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Notifications
                </DialogTitle>
                <DialogContent dividers>
                    {props.lowStockProducts?.length > 0 ? (
                        props.lowStockProducts.map((prod, index) => (
                            <React.Fragment key={index}>
                                <Box
                                    sx={{
                                        backgroundColor: prod.product_quantity <= 5 ? '#ffe5e5' : '#fff8e1', // light red or yellow
                                        borderRadius: 2,
                                        padding: 1.5,
                                        mb: 1,
                                        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: "#333", fontWeight: 500 }}>
                                        ⚠️ <b>{prod.name}</b> has only <b>{prod.product_quantity}</b> left.
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "#666" }}>
                                        Please restock as soon as possible.
                                    </Typography>
                                </Box>
                                {index < props.lowStockProducts.length - 1 && <Divider />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Typography gutterBottom>
                            You currently have no new notifications.
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button autoFocus onClick={handleNotificationClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default TopBar;
