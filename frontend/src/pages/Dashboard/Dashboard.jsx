import React, { useEffect, useState } from "react";
import { Button, message, Select, Spin } from "antd";
import './Dashboard.css';
import requestApi from "../../components/utils/axios";
import DashboardStats from "./DashboardStats";
import DashboardCharts from "./DashboardCharts";
import ProductDrawerChart from "./ProductDrawerChart";
import ProductTable from "./ProductTable";
import TodayProductSales from "./TodayProductSales";
import { jwtDecode } from "jwt-decode";

const { Option } = Select;
const ITEMS_PER_PAGE = 5;

function Dashboard(props) {
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [jwtLocation, setJwtLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [stats, setStats] = useState({ totalQuantity: 0, totalPrice: 0, totalProducts: 0 });

  useEffect(() => {
    const token = localStorage.getItem("D!");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const loc = decoded?.location || "";
        setJwtLocation(loc);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
    fetchLocations();
    fetchStats(); // Fetch total stats once
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await requestApi("GET", "/auth/location");
      setLocations(res.data || []);
    } catch {
      message.error("Failed to load locations");
    }
  };

  useEffect(() => {
    if (!selectedLocation && locations.length && jwtLocation) {
      const match = locations.find(l => l.location === jwtLocation);
      if (match) {
        setSelectedLocation(match);
      }
    }
  }, [locations, jwtLocation, selectedLocation]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (page) => {
    try {
      setLoading(true);
      const res = await requestApi("GET", `/products/qr_products?page=${page}&limit=${ITEMS_PER_PAGE}`);
      const safeData = Array.isArray(res.data.data) ? res.data.data : [];
      setProducts(safeData);
      setTotalProducts(res.data.total || 0);

      if (props.setLowStockProducts) {
        const lowStocks = safeData.filter(p => Number(p.product_quantity) < 10);
        props.setLowStockProducts(lowStocks);
      }
    } catch {
      setProducts([]);
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await requestApi("GET", "/dashboard/stats");
      if (res.data && res.data.data) {
        setStats({
          totalQuantity: res.data.data.totalQuantity || 0,
          totalPrice: parseFloat(res.data.data.totalPrice || 0),
          totalProducts: res.data.data.totalProducts || 0
        });
      }
    } catch {
      message.error("Failed to fetch dashboard stats");
    }
  };

  const topProducts = [...products].sort((a, b) => b.product_quantity - a.product_quantity).slice(0, 5);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Product Dashboard</h2>
        <div>
          <label style={{ marginRight: 8 }}>Location:</label>
          <Select
            style={{ width: 200 }}
            loading={!locations.length}
            value={selectedLocation?._id}
            onChange={(val) => {
              const loc = locations.find(l => l._id === val);
              if (loc) {
                setSelectedLocation(loc);
              }
            }}
          >
            {locations.map(loc => (
              <Option key={loc._id} value={loc._id}>
                {loc.location}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <>
          <DashboardStats
            totalProducts={stats.totalProducts}
            totalStock={stats.totalQuantity}
            totalValue={stats.totalPrice}
          />

          <DashboardCharts
            topProducts={topProducts}
            setDrawerOpen={setDrawerOpen}
          />

          <ProductDrawerChart
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            paginatedProducts={products}
            handleNext={() => setCurrentPage(prev => prev + 1)}
            handlePrev={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            currentPage={currentPage - 1}
            totalProducts={totalProducts}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <ProductTable
              products={products}
              page={currentPage}
              total={totalProducts}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={(page) => setCurrentPage(page)}
            />
            <TodayProductSales />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
