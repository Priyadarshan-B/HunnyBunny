// Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import './Dashboard.css';
import requestApi from "../../components/utils/axios";
import DashboardStats from "./DashboardStats";
import DashboardCharts from "./DashboardCharts";
import ProductDrawerChart from "./ProductDrawerChart";
import ProductTable from "./ProductTable";
import TodayProductSales from "./TodayProductSales";


const ITEMS_PER_PAGE = 15;

function Dashboard(props) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await requestApi("GET", `/products/qr_products`);
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
            <h2 className="dashboard-title">Product Dashboard</h2>

            <DashboardStats
                totalProducts={products.length}
                totalStock={totalStock}
                totalValue={totalValue}
            />

            {/* <div style={{ textAlign: "right", marginBottom: "10px" }}>
                <Button type="primary" onClick={() => setDrawerOpen(true)}>
                    View Full Stock Graph
                </Button>
            </div> */}

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

            <div style={{
                display: "flex",
                gap: "10px"
            }}>
                <ProductTable products={products} />
                <TodayProductSales />
            </div>

        </div>
    );
}

export default Dashboard;
