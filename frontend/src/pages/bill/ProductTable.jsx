import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Select,
  Spin,
  Popconfirm,
} from "antd"; 
import {
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons"; 
import requestApi from "../../components/utils/axios";
import { debounce } from "lodash";
import { jwtDecode } from "jwt-decode";
import CustomCreatableSelect from "../../components/select/CreateSelect";

const { Option } = Select;

const ProductTable = ({
  products,
  handleChange,
  totalAmount,
  handleClearAll,
  handleSaveBill,
  handleProductSelect,
}) => {
  const [dataSource, setDataSource] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [inputMode, setInputMode] = useState({});

  useEffect(() => {
    setDataSource(
      products.length > 0
        ? products
        : [{ code: "", name: "", price: 0, quantity: 1 }]
    );
  }, [products]);

  useEffect(() => {
    const token = localStorage.getItem("D!");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setLocation(decoded?.location || "");
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  const fetchProducts = async (term = "") => {
    if (!term.trim()) {
      setProductList([]);
      return;
    }
    try {
      setLoading(true);
      const res = await requestApi(
        "GET",
        `/products/qr_products?term=${encodeURIComponent(term)}`
      );
      const list = res.data?.data || [];
      setProductList(list);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProductList([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useRef(
    debounce((value) => {
      fetchProducts(value);
    }, 300)
  ).current;

  const handleSearch = (value) => {
    debouncedFetch(value);
  };

  const handleAddRow = () => {
    setDataSource((prev) => [
      ...prev,
      { code: "", name: "", price: 0, quantity: 1 },
    ]);
  };

  const handleDeleteRow = (index) => {
    const newData = [...dataSource];
    newData.splice(index, 1);
    setDataSource(newData);
    handleChange(index, "delete", null);
  };
  const onFieldChange = (index, field, value) => {
    const updated = [...dataSource];
    updated[index][field] =
      field === "price" || field === "quantity" ? Number(value) : value;
    setDataSource(updated);
    handleChange(index, field, value);

    if (["code", "name"].includes(field)) {
      const productFieldList = productList.map((p) => p[field]);
      setInputMode((prev) => ({
        ...prev,
        [`${field}-${index}`]: !productFieldList.includes(value),
      }));
    }
  };

  const handleProductSelectDropdown = (code) => {
    const selected = productList.find((p) => p.code === code);
    if (selected) {
      handleProductSelect({
        code: selected.code,
        name: selected.name,
        price: parseFloat(selected.price),
        quantity: 1,
      });
    }
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      render: (text, record, index) => (
        <CustomCreatableSelect
          className="min-w-[140px]"
          placeholder="code"
          value={text ? { label: text, value: text } : null}
          onInputChange={(inputValue) => {
            if (inputValue) fetchProducts(inputValue);
          }}
          onChange={(option) => {
            const value = option?.value || "";
            const product = productList.find((p) => p.code === value);

            const updated = [...dataSource];
            if (product) {
              updated[index] = {
                code: product.code,
                name: product.name,
                price: parseFloat(product.price),
                quantity: 1,
              };
            } else {
              updated[index].code = value;
            }
            setDataSource(updated);
            handleChange(index, "code", value);
            if (product) {
              handleChange(index, "name", product.name);
              handleChange(index, "price", parseFloat(product.price));
              handleChange(index, "quantity", 1);
            }
          }}
          options={productList.map((p) => ({
            label: `${p.code} - ${p.name}`,
            value: p.code,
          }))}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record, index) => (
        <CustomCreatableSelect
          className="min-w-[180px]"
          placeholder="name"
          value={text ? { label: text, value: text } : null}
          onInputChange={(inputValue) => {
            if (inputValue) fetchProducts(inputValue);
          }}
          onChange={(option) => {
            const value = option?.value || "";
            const product = productList.find((p) => p.name === value);

            const updated = [...dataSource];
            if (product) {
              updated[index] = {
                code: product.code,
                name: product.name,
                price: parseFloat(product.price),
                quantity: 1,
              };
            } else {
              updated[index].name = value;
            }
            setDataSource(updated);
            handleChange(index, "name", value);
            if (product) {
              handleChange(index, "code", product.code);
              handleChange(index, "price", parseFloat(product.price));
              handleChange(index, "quantity", 1);
            }
          }}
          options={productList.map((p) => ({
            label: `${p.name} (${p.code})`,
            value: p.name,
          }))}
        />
      ),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      render: (text, record, index) => (
        <Input
          type="number"
          min={1}
          value={text}
          onChange={(e) => onFieldChange(index, "quantity", e.target.value)}
          placeholder="Qty"
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (text, record, index) => (
        <Input
          type="number"
          min={0}
          step="0.01"
          value={text}
          onChange={(e) => onFieldChange(index, "price", e.target.value)}
          placeholder="Price"
        />
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_, record) => (
        <>₹ {(record.price * record.quantity).toFixed(2)}</>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, __, index) => (
        <Popconfirm
          title="Delete this product?"
          description="Are you sure you want to delete this product?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => handleDeleteRow(index)}
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="bill-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="qr-subtitle">Scanned Products</h3>

        <Select
          showSearch
          allowClear
          placeholder="Search product..."
          style={{ width: 300 }}
          filterOption={false}
          onSearch={handleSearch}
          onSelect={handleProductSelectDropdown}
          notFoundContent={loading ? <Spin size="small" /> : "No product"}
          dropdownStyle={{ maxHeight: 200, overflow: "auto" }}
        >
          {productList.slice(0, 5).map((product) => (
            <Option key={product.code} value={product.code}>
              {product.name} ({product.code}) - ₹{product.price}
            </Option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        rowKey={(record, index) => record.code + index}
        bordered
      />

      <div className="qr-actions" style={{ marginTop: "1rem" }}>
        <Button icon={<PlusOutlined />} type="dashed" onClick={handleAddRow}>
          Add Row
        </Button>
      </div>

      <div className="qr-total">Total Amount: ₹{totalAmount.toFixed(2)}</div>

      <div className="qr-actions">
        <button className="qr-clear-btn" onClick={handleClearAll}>
          Clear All
        </button>
        <button className="qr-bill-btn" onClick={handleSaveBill}>
          Save & Generate Bill
        </button>
      </div>
    </div>
  );
};

export default ProductTable;
