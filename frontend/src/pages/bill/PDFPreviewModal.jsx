// src/components/QRScanner/PDFPreviewModal.jsx
import React from 'react';

const PDFPreviewModal = ({ pdfUrl, onClose, onDownload }) => (
    <div className="pdf-preview-modal">
        <div className="pdf-preview-content">
            <div className="pdf-preview-header">
                <h3>Bill Preview</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="pdf-preview-body">
                <iframe src={pdfUrl} title="PDF Preview" width="100%" height="500px" frameBorder="0" />
            </div>
            <div className="pdf-preview-footer">
                <button className="download-btn" onClick={onDownload}>Download PDF</button>
                <button className="cancel-btn" onClick={onClose}>Cancel</button>
            </div>
        </div>
    </div>
);

export default PDFPreviewModal;
