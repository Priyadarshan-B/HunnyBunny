import React from 'react';
import './Dashboard.css';

const DashboardStats = ({ totalProducts, totalStock, totalValue }) => {
    return (
        <div className="dashboard-cards">
            <div className="card">
                <div className="ribbon r1">Products</div>
                Total Products: <span>{totalProducts}</span>
            </div>
            <div className="card">
                <div className="ribbon r2">Stock</div>
                Total Stock: <span>{totalStock}</span>
            </div>
            <div className="card">
                <div className="ribbon r3">Value</div>
                Total Value: <span>₹ {totalValue.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default DashboardStats;
