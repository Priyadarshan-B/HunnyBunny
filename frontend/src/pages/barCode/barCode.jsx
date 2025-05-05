import React, { useState, useEffect } from 'react';
import ProductTable from '../table/productTable';
import { QRCodeScanner } from './barCodeScan';
import { Layout, notification, Button } from 'antd';

const { Content } = Layout;

function ProductSanner() {
  const [scannedData, setScannedData] = useState([]);
  const [editingData, setEditingData] = useState([]); 
  const [isFinished, setIsFinished] = useState(false);

  const handleScan = (data) => {
    if (data) {
      try {
        const parsedData = JSON.parse(data); 

        const newProduct = {
          id: parsedData.id,
          name: parsedData.productName,
          details: parsedData.productDetails,
          price: parsedData.price,
        };

        setScannedData((prevData) => [...prevData, newProduct]);
        setEditingData((prevData) => [...prevData, { ...newProduct, isEdited: false }]);

      } catch (error) {
        notification.error({
          message: 'Invalid QR Code',
          description: 'QR Code data is invalid or not in the expected format.',
        });
      }
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scannedData),
      });

      if (response.ok) {
        notification.success({
          message: 'Submission Successful',
          description: 'Your products have been submitted successfully.',
        });

        setScannedData([]);
        setEditingData([]);
        setIsFinished(false);
      } else {
        notification.error({
          message: 'Submission Failed',
          description: 'Something went wrong while submitting your products.',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Network Error',
        description: 'Failed to connect to the server.',
      });
    }
  };

  return (
    <Layout className="min-h-screen">
      <Content className="p-5">
        <QRCodeScanner onScan={handleScan} />
        <ProductTable
          scannedData={scannedData}
          setScannedData={setScannedData}
          editingData={editingData}
          setEditingData={setEditingData}
        />

        {!isFinished ? (
          <Button
            onClick={handleFinish}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Finish
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Submit
          </Button>
        )}
      </Content>
    </Layout>
  );
}

export default ProductSanner;
