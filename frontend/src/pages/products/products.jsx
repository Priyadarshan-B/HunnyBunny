import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  DatePicker,
  Spin,
  message,
  Popconfirm,
  Button,
  Input,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import PrintIcon from '@mui/icons-material/Print';
import dayjs from "dayjs";
import requestApi from "../../components/utils/axios";
import apiHost from "../../components/utils/api";
import "./products.css";
import { debounce } from "lodash";
import StickerModal from "../../components/stickerModal/stickerModal";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStates, setEditStates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stickerCount, setStickerCount] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async (term = "") => {
    try {
      setLoading(true);
      const res = await requestApi("GET", `/products/qr_products?term=${term}`);
      setProducts(res.data);

      const initialStates = {};
      res.data.forEach((prod) => {
        initialStates[prod.id] = { pkd: null, exp: null, editing: false };
      });
      setEditStates(initialStates);
    } catch {
      message.error("Failed to fetch products");
      setSearchTerm("");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const debouncedSearch = useCallback(
    debounce((value) => fetchProducts(value), 300),
    []
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length <= 0) {
      fetchProducts("");
    } else {
      debouncedSearch(value);
    }
  };

  const handleEdit = (id) =>
    setEditStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], editing: true },
    }));

  const handleSave = (id) => {
    const { pkd, exp } = editStates[id];
    console.log("Save product:", id, { pkd, exp });
    setEditStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], editing: false },
    }));
  };

  const handleCancel = (id) =>
    setEditStates((prev) => ({
      ...prev,
      [id]: { pkd: null, exp: null, editing: false },
    }));

  const handleDelete = (id) =>
    setEditStates((prev) => ({
      ...prev,
      [id]: { pkd: null, exp: null, editing: false },
    }));

  const handleDateChange = (id, type, _, dateString) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], [type]: dateString },
    }));
  };

  const openStickerModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
    setStickerCount(1);
  };

  // if (loading) return <Spin />;

  return (
    <div>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search by name or code"
        allowClear
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: 24, width: 400, backgroundColor: "var(--background-1)", border: "1px solid var(--border-color)", color: "var(--text)", color: "var(--text)", borderRadius: "5px" }}
      />
      <>

        {products.length > 0 ? <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {products.map((product) => {
            const state = editStates[product.id] || {};
            return (
              <Card
                key={product.id}
                className="custom-card"
                style={{ width: 400 }}
                actions={[
                  state.editing ? (
                    <Popconfirm
                      style={{ color: "#4bf478", fontSize: "20px" }}
                      title="Save changes?"
                      onConfirm={() => handleSave(product.id)}
                    >
                      <SaveOutlined key="save" />
                    </Popconfirm>
                  ) : (
                    <EditOutlined
                      style={{ color: "#4bf478", fontSize: "20px" }}
                      onClick={() => handleEdit(product.id)}
                    />
                  ),
                  state.editing ? (
                    <Popconfirm
                      title="Discard changes?"
                      onConfirm={() => handleCancel(product.id)}
                    >
                      <CloseOutlined key="cancel" />
                    </Popconfirm>
                  ) : (
                    <Popconfirm
                      title="Delete dates?"
                      style={{ color: "#b20900", fontSize: "20px" }}
                      onConfirm={() => handleDelete(product.id)}
                    >
                      <DeleteOutlined
                        style={{ color: "#b20900", fontSize: "20px" }}
                        key="delete"
                      />
                    </Popconfirm>
                  ),
                ]}
              >
                <Button
                  icon={<PrintIcon style={{ color: "#616773" }} />}
                  type="text"
                  shape="circle"
                  style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
                  onClick={(e) => {
                    // if (["svg", "path", "SPAN"].includes(e.target.tagName)) return;
                    openStickerModal(product);
                  }}
                />
                <div className="flex gap-10">
                  <div className="flex flex-1 flex-col items-center">
                    <img
                      src={`${apiHost}/public/${product.qr_code}`}
                      alt="QR code"
                      className="w-24 h-24 object-contain bg-white p-1"
                    />
                    <p className="text-sm font-semibold mt-2">
                      {product.product_code}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col justify-between w-full">
                    <p className="text-lg font-semibold">
                      {product.product_name}
                    </p>
                    <p>₹ {product.product_price}</p>
                    <p>
                      <b>Qty:</b> {product.product_quantity} gm
                    </p>
                    {state.editing ? (
                      <>
                        <DatePicker
                          placeholder="Packed Date"
                          onChange={(d, ds) =>
                            handleDateChange(product.id, "pkd", d, ds)
                          }
                          className="mb-2"
                          format="DD-MM-YYYY"
                          style={{ width: "100%" }}
                        />
                        <DatePicker
                          placeholder="Expiry Date"
                          onChange={(d, ds) =>
                            handleDateChange(product.id, "exp", d, ds)
                          }
                          format="DD-MM-YYYY"
                          minDate={
                            state.pkd ? dayjs(state.pkd, "DD-MM-YYYY") : null
                          }
                          style={{ width: "100%" }}
                        />
                      </>
                    ) : (
                      <>
                        <p>
                          <b>pkd:</b> {state.pkd || "--"}
                        </p>
                        <p>
                          <b>exp:</b> {state.exp || "--"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
          :
          <div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <h2>No products found</h2>
            </div>
          </div>
        }

        {/* sticker modal */}
        <StickerModal
          visible={modalVisible}
          product={selectedProduct}
          onClose={() => setModalVisible(false)}
          stickerCount={stickerCount}
          setStickerCount={setStickerCount}
          editStates={editStates}
        />
      </>
    </div>
  );  
};

export default Products;
