import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import AppLayout from "./components/appLayout/Layout";
import Scan from "./pages/Scan";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout body={<div>Welcome to the App</div>} />} />
        <Route path="/scan" element={<AppLayout body={<Scan />} />} />
        <Route path="/dashboard" element={<AppLayout body={<Dashboard />} />} />
        <Route path="/history" element={<AppLayout body={<History />} />} />
        <Route path="/login" element={<Login />} />

        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;