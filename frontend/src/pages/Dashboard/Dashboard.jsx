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
const ITEMS_PER_PAGE = 15;

function Dashboard(props) {
    const [products, setProducts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [jwtLocation, setJwtLocation] = useState(""); // ✅ Store location name from JWT
    const [loading, setLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    // ✅ Decode JWT to get default location name
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
        fetchLocations(); // fetch even if token not found
    }, []);

    // ✅ Fetch all locations from API
    const fetchLocations = async () => {
        try {
            const res = await requestApi("GET", "/auth/location");
            setLocations(res.data || []);
        } catch {
            message.error("Failed to load locations");
        }
    };

    // ✅ Set selectedLocation from JWT once locations are loaded
    useEffect(() => {
        if (!selectedLocation && locations.length && jwtLocation) {
            const match = locations.find(l => l.location === jwtLocation);
            if (match) {
                setSelectedLocation(match);
            }
        }
    }, [locations, jwtLocation, selectedLocation]);

    // ✅ Fetch products when location is set
    useEffect(() => {
        if (selectedLocation?._id) {
            fetchProducts(selectedLocation._id);
        }
    }, [selectedLocation]);

    const fetchProducts = async (locationId) => {
        try {
            setLoading(true);
            const res = await requestApi("GET", `/products/qr_products?location=${locationId}`);
            setProducts(res.data);
            if (props.setLowStockProducts) {
                const lowStocks = res.data.filter(p => Number(p.product_quantity) < 10);
                props.setLowStockProducts(lowStocks);
            }
        } catch {
            message.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    const totalStock = products.reduce((sum, p) => sum + Number(p.product_quantity), 0);
    const totalValue = products.reduce((sum, p) => sum + Number(p.price) * Number(p.product_quantity), 0);
    const topProducts = [...products].sort((a, b) => b.product_quantity - a.product_quantity).slice(0, 5);
    const paginatedProducts = products.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

    const handleNext = () => {
        if ((currentPage + 1) * ITEMS_PER_PAGE < products.length) setCurrentPage(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 0) setCurrentPage(prev => prev - 1);
    };

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
                        totalProducts={products.length}
                        totalStock={totalStock}
                        totalValue={totalValue}
                    />

                    <DashboardCharts
                        topProducts={topProducts}
                        setDrawerOpen={setDrawerOpen}
                    />

                    <ProductDrawerChart
                        drawerOpen={drawerOpen}
                        setDrawerOpen={setDrawerOpen}
                        paginatedProducts={paginatedProducts}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                        currentPage={currentPage}
                        totalProducts={products.length}
                    />

                    <div style={{ display: "flex", gap: "10px" }}>
                        <ProductTable products={products} />
                        <TodayProductSales />
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;
