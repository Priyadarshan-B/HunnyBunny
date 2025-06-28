import React, { createContext, useState, useEffect, useContext } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ConfigProvider, theme as antdTheme } from "antd";

const ThemeContext = createContext();

export const useThemeToggle = () => useContext(ThemeContext);

const lightVars  = {
    "--background": "f5f6f7",
    "--background-1": "#ffffff",
    "--icons": "#025a63",
    "--document": "#ecebf3",
    "--border-color": "rgb(216, 216, 216)",
    "--icons-rev": "#12c5d1",
    "--icons-bg": "#e5e3f3",
    "--button": "#178a84",
    "--text": "#191c24",
    "--f-weight": "700",
    "--gray-text": "rgb(79, 79, 79)",
    "--button-hover": "#178a84c2",
    "--button-hover-1": "rgb(182, 224, 229)",
    "--shadow": "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
    "--card-hover": "#ededf0",
    "--active-bg": "#ffffff",
    "--light-hover": "#c8dddf",
    "--menu-hover": "#635bff",
    "--card": "#ffff",
    "--wb": "#191c24",
    "--grad": "linear-gradient(110deg, hsl(184deg 84% 45%) 0%, hsl(186deg 55% 81%) 32%, hsl(0deg 0% 100%) 48%, hsl(0deg 0% 100%) 58%, hsl(0deg 0% 100%) 100%)",
    "--float": "linear-gradient(115deg,hsl(232deg 17% 17%) 0%,hsl(232deg 17% 17%) 20%,hsl(232deg 17% 17%) 40%,hsl(231deg 17% 21%) 50%,hsl(231deg 16% 24%) 63%,hsl(231deg 16% 24%) 81%,hsl(231deg 16% 24%) 100%)",
    "--table-header": "lightgray",

};

const darkVars  = {
    "--background": "#0f1015",
    "--background-1": "#191c24",
    "--icons": "#12c5d1",
    "--document": "#0f1015",
    "--border-color": "rgb(39, 39, 39)",
    "--icons-rev": "#025a63",
    "--icons-bg": "#2a2d3b",
    "--button": "#178a84",
    "--text": "#e6e6e6",
    "--f-weight": "500",
    "--active-bg": "#2a2d3b",
    "--gray-text": "rgb(255, 255, 255)",
    "--button-hover": "#262c34",
    "--shadow": "0px 0px 0px solid black",
    "--card-hover": "#202436",
    "--light-hover": "#c8dddf",
    "--menu-hover": "#635bff",
    "--wb": "white",
    "--card": "#313342",
    "--grad": "linear-gradient(115deg,hsl(232deg 17% 17%) 0%,hsl(232deg 17% 17%) 20%,hsl(232deg 17% 17%) 40%,hsl(231deg 17% 21%) 50%,hsl(231deg 16% 24%) 63%,hsl(231deg 16% 24%) 81%,hsl(231deg 16% 24%) 100%);",
    "--float": "linear-gradient(110deg, hsl(184deg 84% 45%) 0%, hsl(186deg 55% 81%) 32%, hsl(0deg 0% 100%) 48%, hsl(0deg 0% 100%) 58%, hsl(0deg 0% 100%) 100%)",
    "--table-header": "#0f1015",


};

const applyCSSVars = (mode) => {
  const vars = mode === "dark" ? darkVars : lightVars;
  Object.entries(vars).forEach(([key, val]) =>
    document.documentElement.style.setProperty(key, val)
  );
};

const ThemeProviderWrapper = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const mode = darkMode ? "dark" : "light";

  useEffect(() => {
    const saved = localStorage.getItem("preferredTheme") || "light";
    setDarkMode(saved === "dark");
    applyCSSVars(saved);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    const modeStr = newMode ? "dark" : "light";
    localStorage.setItem("preferredTheme", modeStr);
    applyCSSVars(modeStr);
  };

  const muiTheme = createTheme({ palette: { mode } });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: "#178a84",
            colorBgContainer: mode === "dark" ? "#191c24" : "#ffffff",
            colorText: mode === "dark" ? "#e6e6e6" : "#191c24",
          },
        }}
      >
        <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProviderWrapper;