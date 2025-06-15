import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import axios from 'axios';
import jsPDF from 'jspdf';
import apiHost from './utils/api';
import './QRScanner.css';

const QRScanner = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const scannedCodes = useRef(new Set());

    const [products, setProducts] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code && !scannedCodes.current.has(code.data)) {
                scannedCodes.current.add(code.data);
                fetchProduct(code.data);
            }
        };
    }, []);

    const fetchProduct = async (code) => {
        try {
            const response = await axios.get(`${apiHost}/products/qr_products?term=${code}`);
            const products = response.data;

            if (!Array.isArray(products) || products.length === 0) {
                throw new Error("No product found");
            }

            const product = products[0];
            const price = parseFloat(product.price);
            if (isNaN(price)) throw new Error("Invalid product price");

            const newProduct = {
                ...product,
                price: price,
                quantity: 1
            };

            setProducts((prev) => [...prev, newProduct]);
            setTotalAmount((prev) => prev + price);
        } catch (error) {
            alert("Product not found or server error.");
            console.error(error);
        }
    };

    const recalculateTotal = (updatedProducts) => {
        const newTotal = updatedProducts.reduce((sum, prod) => sum + prod.price * prod.quantity, 0);
        setTotalAmount(newTotal);
    };

    const handleChange = (index, field, value) => {
        const updated = [...products];
        if (field === 'price') {
            updated[index][field] = parseFloat(value) || 0;
        } else {
            updated[index][field] = parseInt(value) || 0;
        }
        setProducts(updated);
        recalculateTotal(updated);
    };

    useEffect(() => {
        const interval = setInterval(capture, 1000);
        return () => clearInterval(interval);
    }, [capture]);

    const handleClearAll = () => {
        scannedCodes.current.clear();
        setProducts([]);
        setTotalAmount(0);
        setCustomerName('');
        setPaymentMethod('UPI');
    };

    const handleSubmitBill = async () => {
        if (!customerName.trim()) {
            alert("Please enter customer name.");
            return;
        }

        const billDetails = {
            customer_name: customerName,
            total_amount: parseFloat(totalAmount.toFixed(2)),
            payment_method: paymentMethod,
            items: products.map(p => ({
                product_name: p.name,
                quantity: p.quantity,
                unit_price: p.price
            }))
        };

        try {
            await axios.post(`${apiHost}/bills/bill-details`, billDetails);
            alert("Bill details submitted successfully!");
            handleClearAll();
        } catch (error) {
            alert("Failed to submit bill details.");
            console.error(error);
        }
    };

    return (
        <div className="qr-container">
            <div className="qr-reader">
                <h2 className="qr-title">QR Scanner</h2>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/png"
                    videoConstraints={{ facingMode: 'environment' }}
                    style={{ width: '100%' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <div className='qr-reader-table'>
                <h3 className="qr-subtitle">Scanned Products</h3>
                <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ marginBottom: '10px', padding: '5px', width: '200px' }}
                />
                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginLeft: '10px', padding: '5px' }}
                >
                    <option value="UPI">UPI</option>
                    <option value="COD">COD</option>
                    <option value="CARD">CARD</option>
                </select>

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
                                        className="border border-[var(--border-color)]"
                                        style={{ backgroundColor: "var(--document)", color: "var(--text)", width: "70px" }}
                                        type="number"
                                        min="1"
                                        value={prod.quantity}
                                        onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        className="border border-[var(--border-color)]"
                                        style={{ backgroundColor: "var(--document)", color: "var(--text)", width: "70px" }}
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

                <div className="qr-total">Total Amount: ₹{parseFloat(totalAmount)}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
                    <button className="qr-clear-btn" onClick={handleClearAll}>Clear All</button>
                    <button className="qr-bill-btn" onClick={handleSubmitBill}>Submit Bill</button>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
