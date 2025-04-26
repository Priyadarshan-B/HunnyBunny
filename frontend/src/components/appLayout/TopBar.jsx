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
import { Typography, Avatar, Box } from '@mui/material';
import { Cookie } from "@mui/icons-material";
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CryptoJS from "crypto-js";

const secretKey = "your-secret-key";


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

    const name = decrypt(dename);
    const profile = decrypt(deprofile);
    const gmail = decrypt(degmail);
    const navigate = useNavigate();
    const capitalizedName = name ? name.toUpperCase() : "";

    const [anchorEl, setAnchorEl] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
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
            Cookies.remove('name')
            Cookies.remove('id')
            Cookies.remove('role')
            Cookies.remove('profilePhoto')
            Cookies.remove('gmail')
            Cookies.remove('allowedRoutes')
            Cookies.remove('subId')
            Cookies.remove('subName')

            navigate('/materials/login')
            console.log(token)
        }
        catch (err) {
            console.log(err)
        }
    };

    const confirmLogout = () => {
        handleLogout();
        handleCloseDialog();
    };

    return (
        <div
            className="app-topbar"
            style={{
                backgroundColor: "var(--background-1)",
                display: "flex",
                padding: "7px 7px",
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
                    <div className="app-name"><b>BAKERY</b></div>
                </div>
                <div className="top-bar-menus">
                    <CustomizedSwitches />
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
                            fontWeight: "var(--f-weight)"
                        }}
                        onClick={handleClick}
                    >
                        {profile ? (
                            <img
                                src={profile}
                                alt="Profile"
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    marginRight: "5px"
                                }}
                            />
                        ) : (
                            <div style={{ width: "35px", height: "35px", backgroundColor: "#ccc", borderRadius: "50%", marginRight: "5px" }} />
                        )}
                        <div className="topbar-name">{capitalizedName}</div>
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
                                backgroundColor: "var(--background-1)", // Background color for the menu
                                border: "2px solid var(--border-color)", // Border color
                                width: "250px", // Adjusted width
                                padding: "5px", // Padding inside the menu
                            }
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                            <Typography variant="p" sx={{ color: "var(--text)", margin: "5px", marginTop: "0px", position: "absolute", top: "0px", backgroundColor: "var(--document)", width: "100%", padding: "10px 0px 50px 0px", display: "flex", justifyContent: "center", zIndex: "2", borderRadius: "3px", fontWeight: "var(--f-weight)" }}>
                                {name}
                            </Typography>
                            {profile ? (
                                <img
                                    src={profile}
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "50%",
                                        marginRight: "5px",
                                        margin: "10px",
                                        zIndex: "3",
                                        marginTop: "30px",
                                        backgroundColor: "white"
                                    }}
                                />
                            ) : (
                                <div style={{ width: "35px", height: "35px", backgroundColor: "#ccc", borderRadius: "50%", marginRight: "5px" }} />
                            )}

                            <Typography variant="body2" sx={{ color: "var(--text)", fontWeight: "var(--f-weight)" }}>
                                {name}
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
                <DialogTitle sx={{ backgroundColor: "var(--background-1)", color: "var(--text)", borderBottom: "1px solid var(--border-color)", marginBottom: "10px" }} id="logout-dialog-title">{"Logout Confirmation"}</DialogTitle>
                <DialogContent sx={{ backgroundColor: "var(--background-1)", color: "var(--text)" }}>
                    <DialogContentText id="logout-dialog-description" sx={{ backgroundColor: "var(--background-1)", color: "var(--text)" }}>
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
        </div>
    );
}

export default TopBar;
