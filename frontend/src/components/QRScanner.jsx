import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import axios from 'axios';
import jsPDF from 'jspdf';
import apiHost from './utils/api'; // Make sure this path is correct
import './QRScanner.css'; // Your CSS styling

const QRScanner = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const scannedCodes = useRef(new Set());

    const [products, setProducts] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');

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

        const product = products[0]; // use the first product from the array

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
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const startX = 15;
        let startY = 20;

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Product Bill', startX, startY);

        startY += 15;

        // Table column headers
        const headers = ['Code', 'Product Name', 'Qty', 'Price (Rs)', 'Subtotal'];
        const colWidths = [30, 60, 20, 30, 30];
        const rowHeight = 10;

        // Draw table header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        let currentX = startX;

        headers.forEach((header, index) => {
            doc.rect(currentX, startY, colWidths[index], rowHeight); // Border
            doc.text(header, currentX + 2, startY + 7); // Text
            currentX += colWidths[index];
        });

        // Draw table rows
        doc.setFont('helvetica', 'normal');
        startY += rowHeight;

        products.forEach(product => {
            let x = startX;

            const values = [
                product.code.toString(),
                product.name.toString(),
                product.quantity.toString(),
                `Rs. ${parseFloat(product.price).toFixed(2)}`,
                `Rs. ${(product.price * product.quantity).toFixed(2)}`
            ];


            values.forEach((text, i) => {
                doc.rect(x, startY, colWidths[i], rowHeight);
                doc.text(text, x + 2, startY + 7);
                x += colWidths[i];
            });

            startY += rowHeight;
        });

        // Draw total
        // Draw total
        doc.setFont('helvetica', 'bold');
        const totalColSpan = colWidths.slice(0, 4).reduce((a, b) => a + b, 0);
        doc.rect(startX, startY, totalColSpan, rowHeight);
        doc.text('Total Amount:', startX + 2, startY + 7);
        doc.rect(startX + totalColSpan, startY, colWidths[4], rowHeight);
        doc.text(`Rs. ${parseFloat(totalAmount).toFixed(2)}`, startX + totalColSpan + 2, startY + 7);


        return doc;
    };


    const handlePreviewBill = () => {
        if (products.length === 0) {
            alert("No products to generate bill!");
            return;
        }

        const doc = generatePDF();

        // Convert the PDF to a data URL
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
                                        className="border border-[var(--border-color)]" style={{ backgroundColor: "var(--document)", color: "var(--text)", width: "70px" }}
                                        type="number"
                                        min="1"
                                        value={prod.quantity}
                                        onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        className="border border-[var(--border-color)]" style={{ backgroundColor: "var(--document)", color: "var(--text)", width: "70px" }}
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
                    <button className="qr-bill-btn" onClick={handlePreviewBill}>Generate Bill</button>
                </div>
            </div>

            {/* PDF Preview Modal */}
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