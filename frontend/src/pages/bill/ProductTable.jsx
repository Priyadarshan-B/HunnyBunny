// src/components/QRScanner/ProductTable.jsx
import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import requestApi from '../../components/utils/axios';

const { Option } = Select;

const ProductTable = ({
    products,
    handleChange,
    totalAmount,
    handleClearAll,
    handleSaveBill,
    handleProductSelect,
}) => {
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchProducts = async (term = "") => {
        try {
            setLoading(true);
            const res = await requestApi("GET", `/products/qr_products?term=${term}`);
            const list = Array.isArray(res) ? res : res.data || [];
            setProductList(list);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = (value) => {
        fetchProducts(value);
    };

    return (
        <div className="bill-container">
            <div className="flex justify-between items-center mb-4">
                <h3 className="qr-subtitle">Scanned Products</h3>
                <Select
                    showSearch
                    allowClear
                    placeholder="Search product..."
                    style={{ width: 300 }}
                    filterOption={false}
                    onSearch={handleSearch}
                    onSelect={(value) => {
                        const selected = productList.find((p) => p.code === value);
                        if (selected) {
                            handleProductSelect(selected);
                        }
                    }}
                    notFoundContent={loading ? <Spin size="small" /> : "No product"}
                    dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
                >
                    {productList.slice(0, 5).map((product) => (
                        <Option key={product.code} value={product.code}>
                            {product.name} ({product.code}) - ₹{product.price}
                        </Option>
                    ))}
                </Select>
            </div>

            <table className="qr-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((prod, idx) => (
                        <tr key={idx}>
                            <td>{prod.code}</td>
                            <td>{prod.name}</td>
                            <td>
                                <input
                                    className="input-box"
                                    type="number"
                                    min="1"
                                    value={prod.quantity}
                                    onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    className="input-box"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={prod.price}
                                    onChange={(e) => handleChange(idx, 'price', e.target.value)}
                                />
                            </td>
                            <td>₹ {(prod.price * prod.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="qr-total">Total Amount: ₹{totalAmount.toFixed(2)}</div>
            <div className="qr-actions">
                <button className="qr-clear-btn" onClick={handleClearAll}>
                    Clear All
                </button>
                <button className="qr-bill-btn" onClick={handleSaveBill}>
                    Save & Generate Bill
                </button>
            </div>
        </div>
    );
};

export default ProductTable;
