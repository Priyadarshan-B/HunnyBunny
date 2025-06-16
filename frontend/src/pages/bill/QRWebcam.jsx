// QRWebcam.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';

const QRWebcam = ({ onScanProduct }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const scannedCodes = useRef(new Set());

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code && !scannedCodes.current.has(code.data)) {
                scannedCodes.current.add(code.data);
                onScanProduct(code.data);
            }
        };
    }, [onScanProduct]);

    useEffect(() => {
        const interval = setInterval(capture, 1000);
        return () => clearInterval(interval);
    }, [capture]);

    // Inside QRWebcam
    useEffect(() => {
        scannedCodes.current = new Set(); // optional: reset on mount
    }, []);


    return (
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
    );
};

export default QRWebcam;
