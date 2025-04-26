import React, { useState, useEffect } from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import IconButton from '@mui/material/IconButton';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
// Define the theme
const theme = createTheme({
    palette: {
        mode: "light", // Initially set to light mode
    },
});

const lightModeProperties = {
    "--background": "f5f6f7",
    "--background-1": "#ffffff",
    "--icons": "#025a63",
    "--document": "#ecebf3",
    "--border-color": "rgb(216, 216, 216)",
    "--icons-rev": "#12c5d1",
    "--icons-bg": "#e5e3f3",
    "--button": "#178a84",
    "--text": "#191c24",
    "--f-weight":"600",
    "--gray-text": "rgb(79, 79, 79)",
    "--button-hover": "#178a84c2",
    "--button-hover-1": "rgb(182, 224, 229)",
    "--shadow": "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
    "--card-hover": "#ededf0",
    "--active-bg": "#ffffff",
    "--light-hover": "#c8dddf",
    "--menu-hover": "#ecebf3",
    "--card": "#ffff",
    "--wb":"#191c24",
    "--grad": "linear-gradient(110deg, hsl(184deg 84% 45%) 0%, hsl(186deg 55% 81%) 32%, hsl(0deg 0% 100%) 48%, hsl(0deg 0% 100%) 58%, hsl(0deg 0% 100%) 100%)",
    "--float": "linear-gradient(115deg,hsl(232deg 17% 17%) 0%,hsl(232deg 17% 17%) 20%,hsl(232deg 17% 17%) 40%,hsl(231deg 17% 21%) 50%,hsl(231deg 16% 24%) 63%,hsl(231deg 16% 24%) 81%,hsl(231deg 16% 24%) 100%)",


};

const darkModeProperties = {
    "--background": "#0f1015",
    "--background-1": "#191c24",
    "--icons": "#12c5d1",
    "--document": "#0f1015",
    "--border-color": "rgb(39, 39, 39)",
    "--icons-rev": "#025a63",
    "--icons-bg": "#2a2d3b",
    "--button": "#178a84",
    "--text": "#e6e6e6",
    "--f-weight":"600",
    "--active-bg": "#2a2d3b",
    "--gray-text": "rgb(255, 255, 255)",
    "--button-hover": "#262c34",
    "--shadow": "0px 0px 0px solid black",
    "--card-hover": "#202436",
    "--light-hover": "#c8dddf",
    "--menu-hover": "#0f1015",
    "--wb":"white",
    "--card": "#313342",
    "--grad": "linear-gradient(115deg,hsl(232deg 17% 17%) 0%,hsl(232deg 17% 17%) 20%,hsl(232deg 17% 17%) 40%,hsl(231deg 17% 21%) 50%,hsl(231deg 16% 24%) 63%,hsl(231deg 16% 24%) 81%,hsl(231deg 16% 24%) 100%);",
    "--float": "linear-gradient(110deg, hsl(184deg 84% 45%) 0%, hsl(186deg 55% 81%) 32%, hsl(0deg 0% 100%) 48%, hsl(0deg 0% 100%) 58%, hsl(0deg 0% 100%) 100%)",


};

// Set custom properties based on theme mode
const setCustomProperties = (mode) => {
    const root = document.documentElement;
    root.style.cssText = Object.entries(
        mode === "dark" ? darkModeProperties : lightModeProperties
    )
        .map(([key, value]) => `${key}:${value};`)
        .join("");
};

// Styled switch

export default function CustomizedSwitches() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check if the user has a preference for theme stored in local storage
        const preferredTheme = localStorage.getItem("preferredTheme");
        if (preferredTheme) {
            setDarkMode(preferredTheme === "dark");
            setCustomProperties(preferredTheme);
        }
        // If not, set initial mode to light and update custom properties
        else {
            setCustomProperties("light");
        }
    }, []); // Run only on initial render

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        const mode = newMode ? "dark" : "light";
        setCustomProperties(mode); // Update custom properties based on theme mode
        localStorage.setItem("preferredTheme", mode); // Store user preference for theme
    };

    return (
        <ThemeProvider theme={theme}>
            <IconButton sx={{ ml: 1 }} onClick={toggleDarkMode} color="inherit">
                {darkMode ? <WbSunnyIcon sx={{ color: "#6c7293" }} /> : <NightsStayIcon sx={{ color: "#6c7293" }} />}
            </IconButton>
        </ThemeProvider>
    );
}
