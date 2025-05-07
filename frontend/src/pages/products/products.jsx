import React, { useEffect, useState } from "react";
import { Card, DatePicker, Spin, message, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import requestApi from "../../components/utils/axios";
import apiHost from "../../components/utils/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStates, setEditStates] = useState({}); // Stores pkd/exp per product

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await requestApi("GET", "/products/qr_products");
        setProducts(res.data);
        // Initialize edit state
        const initialStates = {};
        res.data.forEach((prod) => {
          initialStates[prod.id] = {
            pkd: null,
            exp: null,
            editing: false,
          };
        });
        setEditStates(initialStates);
      } catch (error) {
        message.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleEdit = (id) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        editing: true,
      },
    }));
  };

  const handleSave = (id) => {
    const { pkd, exp } = editStates[id];
    console.log("Save product:", id, { pkd, exp });
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        editing: false,
      },
    }));
  };

  const handleCancel = (id) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        pkd: null,
        exp: null,
        editing: false,
      },
    }));
  };

  const handleDelete = (id) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        pkd: null,
        exp: null,
        editing: false,
      },
    }));
  };

  const handleDateChange = (id, type, date, dateString) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: dateString,
      },
    }));
  };

  if (loading) return <Spin />;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {products.map((product) => {
        const state = editStates[product.id] || {};
        return (
            <Card
            key={product.id}
            style={{ width: 400 }}
            actions={[
                state.editing ? (
                  <Popconfirm
                    title="Save changes?"
                    onConfirm={() => handleSave(product.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <SaveOutlined key="save" />
                  </Popconfirm>
                ) : (
                  <EditOutlined key="edit" onClick={() => handleEdit(product.id)} />
                ),
                state.editing ? (
                  <Popconfirm
                    title="Discard changes?"
                    onConfirm={() => handleCancel(product.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <CloseOutlined key="cancel" />
                  </Popconfirm>
                ) : (
                  <Popconfirm
                    title="Are you sure to delete dates?"
                    onConfirm={() => handleDelete(product.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <DeleteOutlined key="delete" />
                  </Popconfirm>
                ),
              ]}              
          >
            <div className="flex gap-10">
              <div className="flex flex-1 flex-col items-center">
                <img
                  src={`${apiHost}/public/${product.qr_code}`}
                  alt="QR code"
                  className="w-24 h-24 object-contain"
                />
                <p className="text-sm font-semibold mt-2">{product.product_code}</p>
              </div>
          
              <div className="flex flex-1 flex-col justify-between w-full">
                <p>
                  <b>Name:</b> {product.product_name}
                </p>
                <p>
                  <b>MRP:</b> ₹{product.product_price}
                </p>
                <p>
                  <b>Quantity:</b> {product.product_quantity} gm
                </p>
          
                {state.editing ? (
                  <>
                    <DatePicker
                      placeholder="Packed Date"
                      onChange={(d, ds) => handleDateChange(product.id, "pkd", d, ds)}
                      className="mb-2"
                      style={{ width: "100%" }}
                    />
                    <DatePicker
                      placeholder="Expiry Date"
                      onChange={(d, ds) => handleDateChange(product.id, "exp", d, ds)}
                      style={{ width: "100%" }}
                    />
                  </>
                ) : (
                  <>
                    <p>
                      <b>Pkd:</b> {state.pkd || "--"}
                    </p>
                    <p>
                      <b>Exp:</b> {state.exp || "--"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>          
        );
      })}
    </div>
  );
};

export default Products;
