import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Popconfirm, Form, notification } from 'antd';

const ProductTable = ({
  scannedData,
  setScannedData,
  editingData,
  setEditingData,
}) => {
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  const [isFinished, setIsFinished] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const inputRef = useRef(null); // To focus input automatically

  const isEditing = (record) => record.id === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      details: '',
      price: '',
      ...record,
    });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...editingData];
      const index = newData.findIndex((item) => key === item.id);

      if (index > -1) {
        newData.splice(index, 1, { ...newData[index], ...row, isEdited: true });
        setEditingData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setEditingData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const deleteRecord = (key) => {
    setScannedData(scannedData.filter((item) => item.id !== key));
    notification.success({
      message: 'Deleted',
      description: 'Product record has been deleted successfully.',
    });
  };

  const columns = [
    {
      title: 'Product ID',
      dataIndex: 'id',
      editable: false,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      editable: true,
    },
    {
      title: 'Product Details',
      dataIndex: 'details',
      editable: true,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      editable: true,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) =>
        scannedData.length >= 1 ? (
          <span>
            <Button
              onClick={() => edit(record)}
              style={{ marginRight: 8 }}
              className="bg-blue-500 text-white"
            >
              Edit
            </Button>
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => deleteRecord(record.id)}
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          </span>
        ) : null,
    },
  ];

  const handleSave = () => {
    save(editingKey);
  };

  const mergedColumns = columns.map((col) => ({
    ...col,
    onCell: (record) => ({
      record,
      editable: col.editable,
      title: col.title,
      editable: col.editable || false,
    }),
  }));

  const handleScannerInput = (e) => {
    setScannerInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && scannerInput.trim() !== '') {
      const scannedValue = scannerInput.trim();

      const newProduct = {
        id: scannedValue,
        name: '', // or you can auto-fill if you have any decoding logic
        details: '',
        price: '',
      };

      setScannedData((prevData) => [...prevData, newProduct]);
      setScannerInput(''); // clear input after scan
      notification.success({
        message: 'Scanned Successfully',
        description: `Product ID: ${scannedValue}`,
      });
    }
  };

  useEffect(() => {
    // Focus on the input when component mounts
    inputRef.current?.focus();
  }, []);

  const EditableTable = () => (
    <Table
      components={{
        body: {
          cell: EditableTableCell,
        },
      }}
      bordered
      dataSource={scannedData}
      columns={mergedColumns}
      rowClassName="editable-row"
      pagination={false}
    />
  );

  return (
    <div>
      {/* Hidden input for scanning */}
      <Input
        ref={inputRef}
        style={{ width: 300, marginBottom: 20 }}
        placeholder="Scan barcode here..."
        value={scannerInput}
        onChange={handleScannerInput}
        onKeyDown={handleKeyPress}
      />
      <EditableTable />
      {editingKey && !isFinished && (
        <div className="mt-4">
          <Button onClick={handleSave} type="primary" className="mr-2">
            Save
          </Button>
          <Button onClick={cancel}>Cancel</Button>
        </div>
      )}
    </div>
  );
};

const EditableTableCell = ({
  title,
  editable,
  children,
  record,
  ...restProps
}) => {
  return (
    <td {...restProps}>
      {editable ? (
        <Form.Item
          style={{ margin: 0 }}
          name={title}
          rules={[{ required: true, message: `${title} is required.` }]}
        >
          <Input />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default ProductTable;
