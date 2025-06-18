// ProductDrawerChart.jsx
import React from 'react';
import {
    Drawer, IconButton, Button
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { Divider } from "antd";
import {
    BarChart, Bar, Cell, Tooltip, ResponsiveContainer,
    XAxis, YAxis, Legend
} from "recharts";

const ProductDrawerChart = ({
    drawerOpen, setDrawerOpen,
    paginatedProducts, handleNext, handlePrev,
    currentPage, totalProducts
}) => {
    const getBarColor = (qty) => {
        if (qty < 10) return "#f44336";
        if (qty < 20) return "#ffeb3b";
        return "#4caf50";
    };

    return (
        <Drawer

            anchor="bottom"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{ sx: { width: "100%", height: "100%" } }}
        >
            <div style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#11a8cd", padding: "10px", borderRadius: "5px" }}>
                    <h2>Product Quantities</h2>
                    <IconButton onClick={() => setDrawerOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </div>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ width: '80%', maxWidth: '800px', height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paginatedProducts}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="product_quantity">
                                    {paginatedProducts.map((entry, index) => (
                                        <Cell key={`bar-${index}`} fill={getBarColor(entry.product_quantity)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div style={{ marginTop: 20, textAlign: "center" }}>
                    <Button variant="contained" onClick={handlePrev} disabled={currentPage === 0} style={{ marginRight: 10 }}>Prev</Button>
                    <Button variant="contained" onClick={handleNext} disabled={(currentPage + 1) * 15 >= totalProducts}>Next</Button>
                </div>
            </div>
        </Drawer>
    );
};

export default ProductDrawerChart;
