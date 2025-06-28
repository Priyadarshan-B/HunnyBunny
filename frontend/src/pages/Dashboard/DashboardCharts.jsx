import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, Legend
} from "recharts";
import { Button, Empty } from "antd";
import './Dashboard.css';

const PIE_COLORS = ['#ff7d67', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

const DashboardCharts = ({ topProducts, setDrawerOpen }) => {
  const cleanData = Array.isArray(topProducts)
    ? topProducts.filter(p =>
        p && p.name && typeof p.product_quantity === "number" && !isNaN(p.product_quantity)
      )
    : [];

  return (
    <div className="dashboard-graphs">
      <div className="chart-container">
        <div className="chart-header">
          <h3><b>Top 5 Products by Stock</b></h3>
          <Button type="primary" size="small" onClick={() => setDrawerOpen(true)}>
            View Full Stock Graph
          </Button>
        </div>
        <hr style={{ width: "100%" }} />
        <div style={{ padding: "20px" }}>
          {cleanData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cleanData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="product_quantity" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No product data available" />
          )}
        </div>
      </div>

      <div className="chart-container">
        <h3><b>Stock Distribution</b></h3>
        <hr style={{ width: "100%" }} />
        <div style={{ padding: "20px" }}>
          {cleanData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={cleanData}
                  dataKey="product_quantity"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {cleanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No distribution data available" />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
