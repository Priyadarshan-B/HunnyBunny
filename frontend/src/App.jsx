import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import AppLayout from "./components/appLayout/Layout";
import ScanTable from "./pages/barCode/barCode";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<AppLayout body={<div>Welcome to the App</div>} />} />
        <Route path="/bill" element={<ScanTable/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;