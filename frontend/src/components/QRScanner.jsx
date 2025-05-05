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
            const response = await axios.post(`${apiHost}/getProduct`, { code });
            const product = response.data;
            setProducts((prev) => [...prev, product]);
            setTotalAmount((prev) => prev + product.price);
        } catch (error) {
            alert("Product not found or server error.");
            console.error(error);
        }
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
        // Create a new PDF document
        const doc = new jsPDF();

        // Set title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Product Bill', 15, 20);

        // Create header row
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Code', 15, 40);
        doc.text('Product Name', 65, 40);
        doc.text('Price (₹)', 160, 40);

        // Add horizontal line
        doc.setLineWidth(0.5);
        doc.line(15, 45, 195, 45);

        // Add product rows
        doc.setFont('helvetica', 'normal');
        let yPosition = 55;

        products.forEach((product) => {
            doc.text(product.code.toString(), 15, yPosition);
            doc.text(product.name.toString(), 65, yPosition);
            doc.text(`₹${product.price.toString()}`, 160, yPosition);
            yPosition += 10;
        });

        // Add horizontal line before total
        doc.setLineWidth(0.5);
        doc.line(15, yPosition, 195, yPosition);
        yPosition += 10;

        // Add total
        doc.setFont('helvetica', 'bold');
        doc.text('Total Amount:', 120, yPosition);
        doc.text(`₹${totalAmount.toString()}`, 160, yPosition);

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
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((prod, idx) => (
                            <tr key={idx}>
                                <td>{prod.code}</td>
                                <td>{prod.name}</td>
                                <td>₹{prod.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="qr-total">Total Amount: ₹{totalAmount}</div>
                <div style={{display:"flex", alignItems:"center", justifyContent:"flex-end", gap:"10px"}}>
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