// src/components/QRScanner/ProductTable.jsx
import React from 'react';

const ProductTable = ({ products, handleChange, totalAmount, handleClearAll, handleSaveBill }) => (
    <div className="bill-container">
        <h3 className="qr-subtitle">Scanned Products</h3>
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
                        <td>Rs. {(prod.price * prod.quantity).toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="qr-total">Total Amount: ₹{totalAmount.toFixed(2)}</div>
        <div className="qr-actions">
            <button className="qr-clear-btn" onClick={handleClearAll}>Clear All</button>
            <button className="qr-bill-btn" onClick={handleSaveBill}>Save & Generate Bill</button>
        </div>
    </div>
);

export default ProductTable;
