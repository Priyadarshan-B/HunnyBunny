import React from 'react';
import './Dashboard.css';

const DashboardStats = ({ totalProducts, totalStock, totalValue }) => {
    return (
        <div className="dashboard-cards">
            <div className="card">
                <div className="ribbon r1">Products</div>
                <span>Total Products</span> {totalProducts}
            </div>
            <div className="card">
                <div className="ribbon r2">Stock</div>
                <span>Total Stock </span>{totalStock}
            </div>
            <div className="card">
                <div className="ribbon r3">Value</div>
                <span>Total Value </span>₹ {totalValue.toFixed(2)}
            </div>
        </div>
    );
};

export default DashboardStats;
