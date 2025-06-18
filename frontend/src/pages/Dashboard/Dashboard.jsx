import React, { useEffect, useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, Legend } from "recharts";
import { message } from "antd";
import './Dashboard.css';
import requestApi from "../../components/utils/api";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

function Dashboard() {
    const [products, setProducts] = useState([]);
    const [editStates, setEditStates] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProducts = async (term = "") => {
        try {
            setLoading(true);
            const res = await requestApi("GET", `/products/qr_products?term=${term}`);
            setProducts(res.data);
            console.log("Fetched products:", res.data);
            const initialStates = {};
            res.data.forEach((prod) => {
                initialStates[prod.id] = { qty: null, pkd: null, exp: null, editing: false };
            });
            setEditStates(initialStates);
        } catch {
            message.error("Failed to fetch products");
            setSearchTerm("");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);


    // Derived metrics
    const totalStock = products.reduce((sum, p) => sum + Number(p.product_quantity), 0);
    const totalValue = products.reduce((sum, p) => sum + Number(p.price) * Number(p.product_quantity), 0);

    const topProducts = [...products]
        .sort((a, b) => b.product_quantity - a.product_quantity)
        .slice(0, 5);

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Product Dashboard</h2>

            <div className="dashboard-cards">
                <div className="card">Total Products: <span>{products.length}</span></div>
                <div className="card">Total Stock: <span>{totalStock}</span></div>
                <div className="card">Total Value: <span>₹ {totalValue.toFixed(2)}</span></div>
            </div>

            <div className="dashboard-graphs">
                <div className="chart-container">
                    <h3>Top 5 Products by Stock</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topProducts}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="product_quantity" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>Stock Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={topProducts}
                                dataKey="product_quantity"
                                nameKey="name"
                                outerRadius={80}
                                label
                            >
                                {topProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="dashboard-table">
                <h3>All Products</h3>
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((prod) => (
                                <tr key={prod.id}>
                                    <td>{prod.code}</td>
                                    <td>{prod.name}</td>
                                    <td>₹ {prod.price}</td>
                                    <td>{prod.product_quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
