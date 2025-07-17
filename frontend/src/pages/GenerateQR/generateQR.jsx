import React, { useState, useRef, useEffect } from "react";
import { Input, InputNumber, Button, Form, Modal } from "antd";
import { SyncOutlined, ScanOutlined, CloseOutlined } from "@ant-design/icons";
import { QRCodeCanvas } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import requestApi from "../../components/utils/axios";
import "./generateQR.css";
import {
  showSuccess,
  showError,
  showWarning,
} from "../../components/toast/toast";
import { jwtDecode } from "jwt-decode";

export default function QRForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [qrId, setQrId] = useState(null);
  const [isQRGenerated, setIsQRGenerated] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [scannerModalVisible, setScannerModalVisible] = useState(false);
  const [isScannedProduct, setIsScannedProduct] = useState(false);
  const [externalScannerBuffer, setExternalScannerBuffer] = useState("");
  const [isExternalScannerActive, setIsExternalScannerActive] = useState(false);

  const qrRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("D!");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserLocation(decoded?.location);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  const handleScanBarcode = () => {
    // Check if browser supports camera access
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showError(
        "Camera access not supported in this browser. Please use a modern browser."
      );
      return;
    }

    setScannerModalVisible(true);
    setIsScanning(true);
  };

  const handleExternalScanner = () => {
    setIsExternalScannerActive(true);
    showSuccess(
      "External scanner activated. Type a barcode manually and press Enter, or press ESC to cancel."
    );
  };

  const handleExternalScannerInput = (event) => {
    if (!isExternalScannerActive) return;

    if (event.key === "Enter") {
      // Barcode scan completed
      const barcodeData = externalScannerBuffer.trim();
      if (barcodeData) {
        handleBarcodeScanned(barcodeData);
        setExternalScannerBuffer("");
        setIsExternalScannerActive(false);
      }
    } else if (event.key === "Escape") {
      // Cancel external scanning
      setExternalScannerBuffer("");
      setIsExternalScannerActive(false);
      showWarning("External scanner deactivated.");
    } else if (event.key.length === 1) {
      // Add character to buffer
      setExternalScannerBuffer((prev) => prev + event.key);
    }
  };

  const handleBarcodeScanned = (barcodeData) => {
    setScannedBarcode(barcodeData);
    form.setFieldsValue({ product_id: barcodeData });
    setIsScannedProduct(true); // Mark as scanned product
    setIsScanning(false);
    setScannerModalVisible(false);
    showSuccess(`Barcode scanned: ${barcodeData}`);

    // Stop the scanner safely
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch((error) => {
        console.log("Scanner stop error (ignored):", error);
      });
    }
  };

  const handleClearBarcode = () => {
    setScannedBarcode(null);
    setIsScannedProduct(false); // Reset scanned product flag
    setExternalScannerBuffer(""); // Clear external scanner buffer
    setIsExternalScannerActive(false); // Deactivate external scanner
    form.setFieldsValue({ product_id: "" });
    showSuccess("Barcode cleared. You can scan again or enter manually.");
  };

  const handleCloseScanner = () => {
    setIsScanning(false);
    setScannerModalVisible(false);
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch((error) => {
        console.log("Scanner stop error (ignored):", error);
      });
    }
  };

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length) {
        const cameraId = cameras[0].id;

        await html5QrCode.start(
          cameraId,
          {
            fps: 15, // Higher FPS for better detection
            qrbox: { width: 400, height: 200 }, // Larger scanning area
            aspectRatio: 2.0, // Better for barcode aspect ratio
            disableFlip: false, // Allow flipping for better detection
            formatsToSupport: [
              // QR Code formats
              "QR_CODE",
              // Barcode formats - prioritize common ones
              "EAN_13",
              "EAN_8",
              "CODE_128",
              "CODE_39",
              "UPC_A",
              "UPC_E",
              "CODABAR",
              "ITF",
              "ITF_14",
              "PDF_417",
              "AZTEC",
              "DATA_MATRIX",
              "MAXICODE",
            ],
          },
          (decodedText) => {
            console.log("Code detected:", decodedText);
            handleBarcodeScanned(decodedText);
          },
          (errorMessage) => {
            // Log errors for debugging but don't show to user
            if (errorMessage.includes("NotFoundException")) {
              // This is normal - no code detected yet
              console.log("No code detected yet...");
            } else if (errorMessage.includes("QR code parse error")) {
              console.log("QR/Barcode parse error - trying to detect...");
            } else {
              console.log("Scanner error:", errorMessage);
            }
          }
        );
      } else {
        showError("No camera found. Please check your camera permissions.");
        handleCloseScanner();
      }
    } catch (err) {
      console.error("Scanner error:", err);
      showError(
        "Failed to start camera scanner. Please check camera permissions."
      );
      handleCloseScanner();
    }
  };

  useEffect(() => {
    if (scannerModalVisible && isScanning) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        startScanner();
      }, 100);
    }
  }, [scannerModalVisible, isScanning]);

  // Cleanup scanner on component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((error) => {
          console.log("Scanner cleanup error (ignored):", error);
        });
      }
    };
  }, []);

  // External scanner keyboard listener
  useEffect(() => {
    const handleKeyDown = (event) => {
      handleExternalScannerInput(event);
    };

    if (isExternalScannerActive) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExternalScannerActive, externalScannerBuffer]);

  const handleGenerateQR = async () => {
    try {
      const values = await form.validateFields();
      const productId = values.product_id;
      setQrId(productId);
      setIsQRGenerated(true);
    } catch {
      showWarning("Please fill all required fields before generating QR.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();

      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) {
        showError("QR code not found.");
        return;
      }

      const dataUrl = canvas.toDataURL();
      const blob = await (await fetch(dataUrl)).blob();

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("price", values.price);
      formData.append("quantity", values.quantity);
      formData.append("qr_image", blob, `${values.product_id}.png`);
      formData.append("product_id", values.product_id);
      formData.append("location", userLocation);

      await requestApi("POST", "/products/qr_products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess("Product saved successfully!");
      form.resetFields();
      setIsQRGenerated(false);
      setQrId(null);
      setScannedBarcode(null);
      setIsScannedProduct(false);
      setExternalScannerBuffer("");
      setIsExternalScannerActive(false);
    } catch (err) {
      console.error(err);
      showError("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWithoutQR = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();

      const payload = {
        product_id: values.product_id,
        name: values.name,
        price: values.price,
        quantity: values.quantity,
        location: userLocation,
      };

      await requestApi("POST", "/products/qr_products", payload);

      showSuccess("Product saved without QR code!");
      form.resetFields();
      setIsQRGenerated(false);
      setQrId(null);
      setScannedBarcode(null);
      setIsScannedProduct(false);
      setExternalScannerBuffer("");
      setIsExternalScannerActive(false);
    } catch (err) {
      console.error(err);
      showError("Failed to save product without QR.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6 rounded bg-white [background-color:var(--background)]">
      <h2 className="text-2xl font-semibold mb-6">Add Bakery Product</h2>

      {/* External Scanner Active Indicator */}
      {isExternalScannerActive && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SyncOutlined spin className="mr-2" />
              <span>
                <strong>External Scanner Active</strong> - Type barcode and
                press Enter, or press ESC to cancel
              </span>
            </div>
            <div className="text-xs">
              Buffer: {externalScannerBuffer || "Waiting for scan..."}
            </div>
          </div>
        </div>
      )}

      {/* Scanned Barcode Indicator */}
      {scannedBarcode && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ScanOutlined className="mr-2" />
              <span>
                Barcode scanned: <strong>{scannedBarcode}</strong>
              </span>
            </div>
            <Button
              size="small"
              onClick={handleClearBarcode}
              style={{
                backgroundColor: "#ff4757",
                color: "white",
                border: "none",
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 border border-[var(--border-color)] rounded p-6 shadow-md [background-color:var(--background-1)]">
          <Form form={form} layout="vertical">
            <Form.Item
              name="product_id"
              label={<span className="custom-label">Product ID</span>}
              rules={[{ required: true }]}
            >
              <Input
                className="border border-[var(--border-color)]"
                style={{
                  backgroundColor: "var(--document)",
                  color: "var(--text)",
                }}
                placeholder="Enter unique Product ID"
                disabled={scannedBarcode !== null}
              />
            </Form.Item>

            <Form.Item
              name="name"
              label={<span className="custom-label">Product Name</span>}
              rules={[{ required: true }]}
            >
              <Input
                className="border border-[var(--border-color)]"
                style={{
                  backgroundColor: "var(--document)",
                  color: "var(--text)",
                }}
                placeholder="e.g. Cinnamon Roll"
              />
            </Form.Item>

            <Form.Item
              name="price"
              label={<span className="custom-label">Price</span>}
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ backgroundColor: "var(--document)" }}
                min={0}
                step={0.01}
                className="w-full border border-[var(--border-color)] text-[var(--text)]"
                prefix="₹"
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              label={<span className="custom-label">Quantity</span>}
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ backgroundColor: "var(--document)" }}
                min={1}
                className="w-full border border-[var(--border-color)] text-[var(--text)]"
              />
            </Form.Item>

            <div className="flex gap-2 mt-2 float-right">
              {/* <Button
                style={{
                  backgroundColor: "#ff6b35",
                  color: "white",
                  border: "none",
                }}
                type="default"
                onClick={handleScanBarcode}
                icon={<ScanOutlined />}
                disabled={scannedBarcode !== null}
              >
                Camera Scan
              </Button> */}

              <Button
                style={{
                  backgroundColor: "#2ecc71",
                  color: "white",
                  border: "none",
                }}
                type="default"
                onClick={handleExternalScanner}
                icon={<ScanOutlined />}
                disabled={scannedBarcode !== null || isExternalScannerActive}
              >
                External Scanner
              </Button>

              {/* <Button
                style={{
                  backgroundColor: "#9b59b6",
                  color: "white",
                  border: "none",
                }}
                type="default"
                onClick={() => {
                  const testBarcode = "8901063012813"; // Britannia barcode
                  handleBarcodeScanned(testBarcode);
                }}
                disabled={scannedBarcode !== null}
              >
                Test Barcode
              </Button> */}

              {scannedBarcode && (
                <Button
                  style={{
                    backgroundColor: "#ff4757",
                    color: "white",
                    border: "none",
                  }}
                  type="default"
                  onClick={handleClearBarcode}
                >
                  Clear
                </Button>
              )}

              <Button
                style={{
                  backgroundColor: "#635bff",
                  color: "white",
                  border: "none",
                }}
                type="default"
                onClick={handleGenerateQR}
                loading={loading ? { icon: <SyncOutlined spin /> } : false}
                // disabled={!isQRGenerated}
              >
                Generate QR
              </Button>

              {/* <Button
                style={{ backgroundColor: "#2196f3", color: "white", border: "none" }}
                type="default"
                onClick={handleSaveWithoutQR}
                loading={loading}
              >
                Save without QR
              </Button> */}
            </div>
          </Form>
        </div>

        <div className="flex-1 border border-[var(--border-color)] rounded p-6 shadow-md [background-color:var(--background-1)] flex flex-col items-center justify-center">
          {isScannedProduct ? (
            // For scanned products - show barcode info and save button
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <ScanOutlined className="text-2xl text-green-600 mb-2" />
                <p className="text-sm text-green-700">
                  <strong>Barcode Product</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Product ID: {scannedBarcode}
                </p>
              </div>

              <Button
                style={{
                  backgroundColor: "green",
                  color: "white",
                  border: "none",
                }}
                type="primary"
                onClick={handleSaveWithoutQR}
                loading={loading}
                className="mt-4 w-full"
              >
                Save Product
              </Button>
            </div>
          ) : qrId ? (
            // For manually entered products - show QR code and save button
            <div ref={qrRef} className="text-center">
              <QRCodeCanvas
                style={{ padding: "10px", backgroundColor: "white" }}
                value={qrId}
                size={160}
              />
              <p className="mt-2 text-sm text-gray-500">
                <strong>{qrId}</strong>
              </p>

              <Button
                style={{
                  backgroundColor: "green",
                  color: "white",
                  border: "none",
                }}
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={!isQRGenerated}
                className="mt-4 w-full"
              >
                Save Product
              </Button>
            </div>
          ) : (
            <p className="text-gray-400 text-center">
              Scan barcode or generate QR to preview here
            </p>
          )}
        </div>
      </div>

      {/* Camera Scanner Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <ScanOutlined className="mr-2" />
            <span>Barcode Scanner</span>
          </div>
        }
        open={scannerModalVisible}
        onCancel={handleCloseScanner}
        footer={null}
        width={500}
        centered
        destroyOnClose
        className="scanner-modal"
      >
        <div className="text-center">
          <div
            id="reader"
            className="w-full max-w-md mx-auto"
            style={{ minHeight: "300px" }}
          ></div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Point your camera at a barcode to scan</p>
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: EAN-13, EAN-8, CODE-128, CODE-39, UPC-A, UPC-E,
              and more
            </p>
            <p className="mt-1 text-xs text-gray-500">
              <strong>Tips for better scanning:</strong>
            </p>
            <ul className="mt-1 text-xs text-gray-500 list-disc list-inside">
              <li>Ensure good lighting (avoid shadows)</li>
              <li>Hold camera steady, 4-8 inches from barcode</li>
              <li>Make sure entire barcode is in the scanning area</li>
              <li>Avoid glare and reflections</li>
              <li>Try different angles if it doesn't work</li>
            </ul>
          </div>
          <div className="mt-4 flex gap-2 justify-center">
            <Button
              onClick={handleCloseScanner}
              icon={<CloseOutlined />}
              type="default"
            >
              Close Scanner
            </Button>
            <Button
              onClick={() => {
                const manualCode = prompt("Enter barcode manually:");
                if (manualCode && manualCode.trim()) {
                  handleBarcodeScanned(manualCode.trim());
                }
              }}
              type="primary"
            >
              Enter Barcode Manually
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
