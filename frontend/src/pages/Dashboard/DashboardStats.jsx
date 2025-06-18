// DashboardStats.jsx
import React from 'react';
import './Dashboard.css';

const DashboardStats = ({ totalProducts, totalStock, totalValue }) => {
    return (
        <div className="dashboard-cards">
            <div className="card">Total Products: <span>{totalProducts}</span></div>
            <div className="card">Total Stock: <span>{totalStock}</span></div>
            <div className="card">Total Value: <span>₹ {totalValue.toFixed(2)}</span></div>
        </div>
    );
};

export default DashboardStats;
