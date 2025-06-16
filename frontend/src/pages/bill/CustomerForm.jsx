// src/components/QRScanner/CustomerForm.jsx
import React from 'react';

const CustomerForm = ({ customerName, setCustomerName, paymentMethod, setPaymentMethod }) => (
    <div className="qr-form">
        <label>Customer Name:</label>
        <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="qr-input"
        />
        <label>Payment Method:</label>
        <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="qr-select"
        >
            <option value="" disabled>Select Payment</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="COD">Cash on Delivery</option>
            <option value="CARD">Card</option>
        </select>
    </div>
);

export default CustomerForm;
