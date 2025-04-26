import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CustomizedSwitches from "./toggleTheme";
import Cookies from "js-cookie";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { Typography, Avatar, Box, IconButton, styled } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import CloseIcon from '@mui/icons-material/Close';
import CryptoJS from "crypto-js";
import image from "../../assets/image.png";

const secretKey = "your-secret-key";

// Customized Bootstrap Dialog for Notifications
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function TopBar(props) {
    const dename = Cookies.get("name") || "";
    const deprofile = Cookies.get("profilePhoto") || "";
    const degmail = Cookies.get("gmail") || "";
    const decrypt = (data) => {
        try {
            return CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8);
        } catch (e) {
            console.error("Decryption failed", e);
            return "";
        }
    };

    const dummyUsername = "jothshana";
    const firstLetter = dummyUsername.charAt(0).toUpperCase();
    const displayUsername = firstLetter + dummyUsername.slice(1);
    const gmail = "jothshana.cs22@bitsathy.ac.in";

    const name = decrypt(dename);
    const profile = decrypt(deprofile);
    const navigate = useNavigate();
    const capitalizedName = name ? name.toUpperCase() : "";

    const [anchorEl, setAnchorEl] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

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

    const handleLogout = async () => {
        try {
            Cookies.remove("token");
            Cookies.remove('name');
            Cookies.remove('id');
            Cookies.remove('role');
            Cookies.remove('profilePhoto');
            Cookies.remove('gmail');
            Cookies.remove('allowedRoutes');
            Cookies.remove('subId');
            Cookies.remove('subName');

            navigate('/materials/login');
        }
        catch (err) {
            console.log(err);
        }
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
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%"
                }}
            >
                <div style={{ display: "flex" }}>
                    <div onClick={props.sidebar} className="sidebar-menu">
                        <MenuIcon style={{ color: "#7e57c2", margin: "0px 5px" }} />
                    </div>
                    <div className="app-name">
                        <FastfoodIcon sx={{ color: "orange" }} /><b> Bakery</b>
                    </div>
                </div>
                <div className="top-bar-menus">
                    <p style={{ display: "none" }}><CustomizedSwitches /></p>
                    <NotificationsActiveOutlinedIcon
                        sx={{ color: "#616773", fontSize: "22px", cursor: "pointer" }}
                        onClick={handleNotificationClick}
                    />
                    <div
                        className="box"
                        style={{
                            backgroundColor: "var(--document)",
                            borderRadius: "5px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "5px 10px 5px 7px",
                            border: "1px solid var(--border-color)",
                            cursor: "pointer",
                            margin: "0px 5px",
                            fontWeight: "var(--f-weight)",
                            gap: "15px"
                        }}
                        onClick={handleClick}
                    >
                        {profile ? (
                            <div style={{ backgroundColor: "#ff7d67", padding: "5px 13px", borderRadius: "5px" }}>
                                {firstLetter}
                            </div>
                        ) : (
                            <div style={{ backgroundColor: "#ff7d67", padding: "5px 13px", borderRadius: "5px" }}>
                                {firstLetter}
                            </div>
                        )}
                        <div className="topbar-name">{displayUsername}</div>
                        <KeyboardArrowDownRoundedIcon />
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
                                {displayUsername}
                            </Typography>
                            <img
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
                            />
                            <Typography variant="body2" sx={{ color: "var(--text)", fontWeight: "var(--f-weight)" }}>
                                {displayUsername}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "var(--text)", marginBottom: "10px" }}>
                                {gmail}
                            </Typography>
                        </Box>
                        <button className="logout-button" onClick={handleLogoutClick}>LOGOUT</button>
                    </Menu>
                </div>
            </div>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={openDialog}
                fullWidth={true}
                onClose={handleCloseDialog}
                aria-labelledby="logout-dialog-title"
                aria-describedby="logout-dialog-description"
                sx={{ "& .MuiDialog-paper": { backgroundColor: "var(--background-1)", color: "var(--text)" } }}
            >
                <DialogTitle
                    sx={{
                        backgroundColor: "var(--background-1)",
                        color: "var(--text)",
                        borderBottom: "1px solid var(--border-color)",
                        marginBottom: "10px"
                    }}
                    id="logout-dialog-title"
                >
                    {"Logout Confirmation"}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: "var(--background-1)", color: "var(--text)" }}>
                    <DialogContentText
                        id="logout-dialog-description"
                        sx={{ backgroundColor: "var(--background-1)", color: "var(--text)" }}
                    >
                        Are you sure you want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmLogout} color="primary" autoFocus>
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notifications Dialog */}
            <BootstrapDialog
                onClose={handleNotificationClose}
                aria-labelledby="customized-dialog-title"
                open={notificationDialogOpen}
            >
                <div style={{backgroundColor: "var(--background-1)", color: "var(--text)"}}>
                    <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                        Notifications
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={handleNotificationClose}
                        sx={(theme) => ({
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme.palette.grey[500],
                        })}
                    >
                        <CloseIcon />
                    </IconButton>
                    <DialogContent dividers>
                        <Typography gutterBottom>
                            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
                            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
                            consectetur ac, vestibulum at eros.
                        </Typography>
                        <Typography gutterBottom>
                            Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
                            Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                        </Typography>
                        <Typography gutterBottom>
                            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus
                            magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec
                            ullamcorper nulla non metus auctor fringilla.
                        </Typography>
                    </DialogContent>
                </div>
            </BootstrapDialog>

        </div>
    );
}

export default TopBar;
