import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AppLayout from "./components/appLayout/Layout";
import ToastMessage from "./components/toast/toast";
import ThemeProviderWrapper from "./components/appLayout/theme/toggleTheme";
import Scan from "./pages/bill/Scan";
import Dashboard from "./pages/Dashboard/Dashboard";
import QRForm from "./pages/GenerateQR/generateQR";
import History from "./pages/history/history";
import Products from "./pages/products/products";
import Register from "./pages/loginPage/register";
import Login from "./pages/loginPage/loginPage";
import './App.css'
function App() {
  return (
    <ThemeProviderWrapper>
      <BrowserRouter>
        <ToastMessage />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/scan" element={<AppLayout body={<Scan />} />} />
          <Route
            path="/dashboard"
            element={<AppLayout body={<Dashboard />} />}
          />
          <Route path="/history" element={<AppLayout body={<History />} />} />
          <Route path="/qr" element={<AppLayout body={<QRForm />} />} />
          <Route path="/products" element={<AppLayout body={<Products />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </ThemeProviderWrapper>
  );
}

export default App;
