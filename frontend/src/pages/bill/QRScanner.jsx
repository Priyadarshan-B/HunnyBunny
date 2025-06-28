// QRScanner.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import QRWebcam from "./QRWebcam";
import ProductTable from "./ProductTable";
import CustomerForm from "./CustomerForm";
import PDFPreviewModal from "./PDFPreviewModal";
import generatePDF from "../../components/utils/pdfGenerator";
import axios from "axios";
import apiHost from "../../components/utils/api";
import "./QRScanner.css";
import { showSuccess, showError, showWarning } from "../../components/toast/toast";
import requestApi from "../../components/utils/axios";
import { jwtDecode } from "jwt-decode";

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
    const [userLocation, setUserLocation] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("D!");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserLocation(decoded?.location || "");
            } catch (err) {
                console.error("Error decoding token:", err);
            }
        }
    }, []);

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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "F5") {
                e.preventDefault();
                handleSaveBillOnly();
            } else if (e.key === "F6") {
                e.preventDefault();
                handleSaveBill();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [products, customerName, paymentMethod]);

    const fetchProduct = async (code) => {
        try {
            const res = await axios.get(`${apiHost}/products/qr_products?term=${code}`);
            const prod = res.data.data?.[0];
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
        setProducts((prev) => {
            let updated = [...prev];
            if (field === "delete") {
                updated.splice(index, 1);
            } else {
                if (!updated[index]) {
                    updated[index] = { code: "", name: "", price: 0, quantity: 1 };
                }
                if (["price", "quantity"].includes(field)) {
                    updated[index][field] = parseFloat(value) || 0;
                } else {
                    updated[index][field] = value;
                }
            }
            recalculateTotal(updated);
            return updated;
        });
    };

    const handleClearAll = () => {
        scannedCodes.current.clear();
        setProducts([]);
        setTotalAmount(0);
        setCustomerName("");
        setPaymentMethod("UPI");
    };

    const handleProductSelect = (product) => {
        const exists = products.some((p) => p.code === product.code);
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

    const buildPayload = () => ({
        customer_name: customerName,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        location: userLocation,
        items: products.map(p => ({
            product_name: p.name,
            quantity: p.quantity,
            unit_price: p.price
        }))
    });

    const handleSaveBillOnly = async () => {
        if (!customerName.trim()) {
            // alert("Enter customer name ");
            showWarning("Enter Customer Name")
            return;
        }
         if (products.length === 0) {
            // alert("scan at least one product.");
            showWarning("Scan Atleast 1 Product")
            return;
        }
        try {
            await requestApi("POST", `/bills/bill-details`, buildPayload());
            showSuccess("Bill saved successfully (F5)");
            handleClearAll();
        } catch {
            showError("Failed to save bill.");
        }
    };

    const handleSaveBill = async () => {
        if (!customerName.trim()) {
            // alert("Enter customer name and scan at least one product.");
            showWarning("Enter Customer Name")
            return;
        }
        if ( products.length === 0) {
            // alert("Enter customer name and scan at least one product.");
            showWarning("Scan Atleast 1 products")
            return;
        }
        try {
            await requestApi("POST", `/bills/bill-details`, buildPayload());
            showSuccess("Bill saved successfully!");
            handlePreviewBill();
            handleClearAll();
        } catch {
            showError("Failed to save bill.");
        }
    };

    const handlePreviewBill = () => {
        const doc = generatePDF(products, totalAmount);
        const dataUri = doc.output("datauristring");
        setPdfUrl(dataUri);
        setShowPreview(true);
    };

    useEffect(() => {
        let inputBuffer = "";

        const handleKeyPress = (e) => {
            if (e.key === "Enter") {
                const code = inputBuffer.trim();
                inputBuffer = "";
                if (code && !scannedCodes.current.has(code)) {
                    scannedCodes.current.add(code);
                    fetchProduct(code);
                }
            } else {
                inputBuffer += e.key;
            }
        };

        window.addEventListener("keypress", handleKeyPress);
        return () => {
            window.removeEventListener("keypress", handleKeyPress);
        };
    }, []);

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
                <div className="flex justify-end bg-[var(--background-1)] bill-container">
                    <button className="qr-clear-btn" onClick={handleClearAll}>Clear All</button>
                    <button className="qr-bill-btn" onClick={handleSaveBillOnly}>Save</button>
                    <button className="qr-bill-btn" onClick={handleSaveBill}>Save & Generate Bill</button>
                </div>
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