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
        const newTotal = updatedProducts.reduce((sum, prod) => {
            return sum + prod.price * prod.quantity;
        }, 0);
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
    const generatePDF = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: [226.77, 1000] // 80mm width, height will auto-expand
        });

        const startX = 10;
        let y = 20;

        // Fonts
        doc.setFont('Courier', 'bold');
        doc.setFontSize(13);
        doc.text('HUNNY BUNNY', 113, y, { align: 'center' });
        y += 15;

        doc.setFontSize(9);
        doc.text('TIRUCHENGODE ROAD CORNER', 113, y, { align: 'center' });
        y += 12;
        doc.text('NAMAKKAL - 637001', 113, y, { align: 'center' });
        y += 12;
        doc.text('Ph: 9443385035, 9585541355', 113, y, { align: 'center' });
        y += 12;

        doc.text('------------------------------------------', 113, y, { align: 'center' });
        y += 12;

        const billNo = '50639';
        const time = new Date().toLocaleTimeString();
        const date = new Date().toLocaleDateString();

        doc.text(`Bill #: ${billNo}`, startX, y);
        doc.text(`Server`, 180, y);
        y += 12;
        doc.text(`Date: ${date}`, startX, y);
        doc.text(`Time: ${time}`, 180, y);
        y += 12;

        doc.text('------------------------------------------', 113, y, { align: 'center' });
        y += 12;

        doc.setFont('Courier', 'bold');
        doc.text('Particulars       Qty   Rate   Amount', startX, y);
        y += 10;

        doc.setFont('Courier', 'normal');
        products.forEach(prod => {
            const name = prod.name.length > 14 ? prod.name.substring(0, 14) : prod.name.padEnd(14, ' ');
            const qty = prod.quantity.toString().padStart(3, ' ');
            const rate = prod.price.toFixed(2).padStart(6, ' ');
            const amount = (prod.price * prod.quantity).toFixed(2).padStart(7, ' ');
            doc.text(`${name} ${qty} ${rate} ${amount}`, startX, y);
            y += 12;
        });

        y += 5;

        // Totals
        const totalQty = products.reduce((sum, p) => sum + p.quantity, 0).toFixed(2);
        const itemCount = products.length;

        doc.text(`Qty : ${totalQty}`, startX, y);
        doc.text(`Items : ${itemCount}`, 100, y);
        doc.text(`Total Amt : ${totalAmount.toFixed(2)}`, 160, y);
        y += 12;
        doc.text(`Round off : 0.00`, startX, y);
        y += 12;

        doc.setFont('Courier', 'bold');
        doc.text('-----------------------------', 113, y, { align: 'center' });
        y += 12;
        doc.text('N E T   A M O U N T', 113, y, { align: 'center' });
        y += 12;
        doc.text(`₹ ${totalAmount.toFixed(2)}`, 113, y, { align: 'center' });
        y += 12;
        doc.text(`( Rupees ${totalAmount.toFixed(2)} Only )`, 113, y, { align: 'center' });
        y += 12;
        doc.text('-----------------------------', 113, y, { align: 'center' });
        y += 15;

        doc.setFontSize(9);
        doc.setFont('Courier', 'normal');
        doc.text('UNIT OF SRI SAKTHI BAKERY, SWEETS & SNACKS', 100, y, { align: 'center' });
        y += 12;
        doc.setFont('Courier', 'bold');
        doc.text('!! Thanks !!! Visit Again !!', 113, y, { align: 'center' });
        y += 12;
        doc.setFont('Courier', 'normal');
        doc.text('For Order & Enquiry', 113, y, { align: 'center' });
        y += 12;
        doc.text('Call us on 9443385035', 113, y, { align: 'center' });

        return doc;
    };


    const handlePreviewBill = () => {
        if (products.length === 0) {
            alert("No products to generate bill!");
            return;
        }

        const doc = generatePDF();
        const pdfData = doc.output('datauristring');
        setPdfUrl(pdfData);
        setShowPreview(true);
    };

    const handleDownloadBill = () => {
        const doc = generatePDF();
        doc.save('Product_Bill.pdf');
        setShowPreview(false);
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setPdfUrl('');
    };

    const handleSaveBill = async () => {
        if (!customerName.trim() || products.length === 0) {
            alert("Enter customer name and scan at least one product.");
            return;
        }

        const payload = {
            customer_name: customerName,
            total_amount: totalAmount,
            payment_method: paymentMethod,
            items: products.map((p) => ({
                product_name: p.name,
                quantity: p.quantity,
                unit_price: p.price
            }))
        };

        try {
            await axios.post('http://localhost:5000/bills/bill-details', payload);
            alert("Bill saved successfully!");
            handlePreviewBill();
            handleClearAll();
        } catch (error) {
            console.error(error);
            alert("Error saving bill.");
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


            <div className="qr-reader-table">
                <div className="qr-form">
                    <label>Customer Name:</label>
                    <input
                        type="text"
                        placeholder="Enter name"
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
                        <option value="" disabled>Select Payment Method</option>
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="COD">Cash on Delivery</option>
                        <option value="CARD">Card</option>
                    </select>
                </div>

                <div className='bill-container'>
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
                        {/* <button className="qr-save-btn" onClick={handleSaveBill}>Save Bill</button> */}
                    </div>
                </div>


            </div>

            {showPreview && (
                <div className="pdf-preview-modal">
                    <div className="pdf-preview-content">
                        <div className="pdf-preview-header">
                            <h3>Bill Preview</h3>
                            <button className="close-btn" onClick={handleClosePreview}>×</button>
                        </div>
                        <div className="pdf-preview-body">
                            <iframe
                                src={pdfUrl}
                                title="PDF Preview"
                                width="100%"
                                height="500px"
                                frameBorder="0"
                            />
                        </div>
                        <div className="pdf-preview-footer">
                            <button className="download-btn" onClick={handleDownloadBill}>Download PDF</button>
                            <button className="cancel-btn" onClick={handleClosePreview}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
