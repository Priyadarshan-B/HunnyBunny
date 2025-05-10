import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import AppLayout from "./components/appLayout/Layout";
import ToastMessage from "./components/toast/toast";
import Scan from "./pages/Scan";
import Dashboard from "./pages/Dashboard";
import QRForm from "./pages/qrCode/qrCode";
import History from "./pages/History";
import Products from "./pages/products/products";
import Login from "./pages/loginPage/loginPage";
function App() {
  return (
    <BrowserRouter>
      <ToastMessage />
      <Routes>
        <Route path="/" element={<AppLayout body={<div>Welcome to the App</div>} />} />
        <Route path="/scan" element={<AppLayout body={<Scan />} />} />
        <Route path="/dashboard" element={<AppLayout body={<Dashboard />} />} />
        <Route path="/history" element={<AppLayout body={<History />} />} />
        <Route path="/qr" element={<AppLayout body={<QRForm />} />} />
        <Route path="/products" element={<AppLayout body={<Products />} />} />
        <Route path="/login" element={<Login />} />

        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;