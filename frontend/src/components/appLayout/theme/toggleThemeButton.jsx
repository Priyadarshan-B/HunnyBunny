import React from "react";
import IconButton from "@mui/material/IconButton";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import { useThemeToggle } from "./toggleTheme";

const ThemeToggleButton = () => {
  const { darkMode, toggleTheme } = useThemeToggle();

  return (
    <IconButton onClick={toggleTheme}>
      {darkMode ? (
        <WbSunnyIcon sx={{ color: "#616773", fontSize: 22 }} />
      ) : (
        <NightsStayIcon sx={{ color: "#616773", fontSize: 22 }} />
      )}
    </IconButton>
  );
};

export default ThemeToggleButton;
