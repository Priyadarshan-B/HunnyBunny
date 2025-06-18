// src/components/QRScanner/QRScanner.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import QRWebcam from "./QRWebcam";
import ProductTable from "./ProductTable";
import CustomerForm from "./CustomerForm";
import PDFPreviewModal from "./PDFPreviewModal";
import generatePDF from "../../components/utils/pdfGenerator";
import axios from "axios";
import apiHost from "../../components/utils/api";
import "./QRScanner.css";

const QRScanner = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const scannedCodes = useRef(new Set());

    const [products, setProducts] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("UPI");

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = window.jsQR(
                imageData.data,
                imageData.width,
                imageData.height
            );

            if (code && !scannedCodes.current.has(code.data)) {
                scannedCodes.current.add(code.data);
                fetchProduct(code.data);
            }
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(capture, 1000);
        return () => clearInterval(interval);
    }, [capture]);

    const fetchProduct = async (code) => {
        try {
            const res = await axios.get(`${apiHost}/products/qr_products?term=${code}`);
            const prod = res.data?.[0];
            if (!prod) throw new Error("Product not found");

            const price = parseFloat(prod.price);
            const newProduct = { ...prod, price, quantity: 1 };

            setProducts((prev) => {
                const exists = prev.some((p) => p.code === newProduct.code);
                if (exists) return prev;
                return [...prev, newProduct];
            });
        } catch {
            alert("Product not found or error.");
        }
    };

    const recalculateTotal = (updated) => {
        const total = updated.reduce((sum, p) => sum + p.price * p.quantity, 0);
        setTotalAmount(total);
    };

    const handleChange = (index, field, value) => {
        const updated = [...products];
        updated[index][field] =
            field === "price" ? parseFloat(value) : parseInt(value);
        setProducts(updated);
        recalculateTotal(updated);
    };

    const handleClearAll = () => {
        scannedCodes.current.clear();
        setProducts([]);
        setTotalAmount(0);
        setCustomerName("");
        setPaymentMethod("UPI");
    };

    const handleProductSelect = (product) => {
        const exists = products.some(p => p.code === product.code);
        if (!exists) {
            const newProduct = {
                code: product.code,
                name: product.name,
                price: parseFloat(product.price),
                quantity: 1,
            };
            const updated = [...products, newProduct];
            setProducts(updated);
            recalculateTotal(updated);
        }
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
            items: products.map(p => ({
                product_name: p.name,
                quantity: p.quantity,
                unit_price: p.price
            }))
        };

        try {
            await axios.post(`${apiHost}/bills/bill-details`, payload);
            alert("Bill saved successfully!");
            handlePreviewBill();
            handleClearAll();
        } catch {
            alert("Error saving bill.");
        }
    };

    const handlePreviewBill = () => {
        const doc = generatePDF(products, totalAmount);
        const dataUri = doc.output("datauristring");
        setPdfUrl(dataUri);
        setShowPreview(true);
    };

    return (
        <div className="qr-container">
            <QRWebcam onScanProduct={fetchProduct} />
            <div className="qr-reader-table">
                <CustomerForm
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                />
                <ProductTable
                    products={products}
                    handleChange={handleChange}
                    totalAmount={totalAmount}
                    handleClearAll={handleClearAll}
                    handleSaveBill={handleSaveBill}
                    handleProductSelect={handleProductSelect}
                />
            </div>
            {showPreview && (
                <PDFPreviewModal
                    pdfUrl={pdfUrl}
                    onClose={() => setShowPreview(false)}
                    onDownload={() => {
                        const doc = generatePDF(products, totalAmount);
                        doc.save("Product_Bill.pdf");
                        setShowPreview(false);
                    }}
                />
            )}
        </div>
    );
};

export default QRScanner;
