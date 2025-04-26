import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import AppLayout from "./components/appLayout/Layout";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<AppLayout body={<div>Welcome to the App</div>} />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;