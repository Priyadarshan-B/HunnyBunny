import React, { useEffect, useState, useRef } from "react";
import { Card, DatePicker, Spin, message, Popconfirm, Modal, Input, Button } from "antd";
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import requestApi from "../../components/utils/axios";
import apiHost from "../../components/utils/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStates, setEditStates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stickerCount, setStickerCount] = useState(1);
  const previewRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await requestApi("GET", "/products/qr_products");
        setProducts(res.data);
        const initialStates = {};
        res.data.forEach((prod) => {
          initialStates[prod.id] = { pkd: null, exp: null, editing: false };
        });
        setEditStates(initialStates);
      } catch {
        message.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleEdit = (id) => setEditStates(prev => ({
    ...prev,
    [id]: { ...prev[id], editing: true },
  }));

  const handleSave = (id) => {
    const { pkd, exp } = editStates[id];
    console.log("Save product:", id, { pkd, exp });
    setEditStates(prev => ({
      ...prev,
      [id]: { ...prev[id], editing: false },
    }));
  };

  const handleCancel = (id) => setEditStates(prev => ({
    ...prev,
    [id]: { pkd: null, exp: null, editing: false },
  }));

  const handleDelete = (id) => setEditStates(prev => ({
    ...prev,
    [id]: { pkd: null, exp: null, editing: false },
  }));

  const handleDateChange = (id, type, _, dateString) => {
    setEditStates(prev => ({
      ...prev,
      [id]: { ...prev[id], [type]: dateString },
    }));
  };

  const openStickerModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
    setStickerCount(1);
  };

  const generatePDFPreview = async () => {
    const input = previewRef.current;
    if (!input) return;

    // Hide container for sticker cloning
    const stickerWrapper = document.createElement("div");
    stickerWrapper.style.position = "absolute";
    stickerWrapper.style.right = "-9999px";
    stickerWrapper.style.top = "0";
    document.body.appendChild(stickerWrapper);

    // Clone stickers without margin
    for (let i = 0; i < stickerCount; i++) {
      const clone = input.cloneNode(true);
      clone.style.margin = "0";
      clone.style.display = "inline-block";
      stickerWrapper.appendChild(clone);
    }

    // Sticker dimensions
    const stickerWidth = 105;
    const stickerHeight = 40;
    const stickersPerRow = 2;

    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < stickerCount; i++) {
      // Render each sticker individually
      const singleStickerCanvas = await html2canvas(input, {
        useCORS: true,
        scale: 2,
      });
      const stickerImage = singleStickerCanvas.toDataURL("image/png");

      // Positioning
      const px = (i % stickersPerRow) * stickerWidth;
      const py = (Math.floor(i / stickersPerRow) % Math.floor(pdfHeight / stickerHeight)) * stickerHeight;

      // New page if needed
      if (i > 0 && i % (stickersPerRow * Math.floor(pdfHeight / stickerHeight)) === 0) {
        pdf.addPage();
      }

      // Add to PDF
      pdf.addImage(stickerImage, "PNG", px, py, stickerWidth, stickerHeight);
    }

    // Cleanup and output
    document.body.removeChild(stickerWrapper);
    pdf.output("dataurlnewwindow");
  };


  if (loading) return <Spin />;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {products.map((product) => {
          const state = editStates[product.id] || {};
          return (
            <Card
              key={product.id}
              className="custom-card"
              style={{ width: 400 }}
              onClick={(e) => {
                if (["svg", "path", "SPAN"].includes(e.target.tagName)) return;
                openStickerModal(product);
              }}
              actions={[
                state.editing ? (
                  <Popconfirm title="Save changes?" onConfirm={() => handleSave(product.id)}>
                    <SaveOutlined key="save" />
                  </Popconfirm>
                ) : (
                  <EditOutlined style={{ color: "#4bf478", fontSize: "20px" }} onClick={() => handleEdit(product.id)} />
                ),
                state.editing ? (
                  <Popconfirm title="Discard changes?" onConfirm={() => handleCancel(product.id)}>
                    <CloseOutlined key="cancel" />
                  </Popconfirm>
                ) : (
                  <Popconfirm title="Delete dates?" onConfirm={() => handleDelete(product.id)}>
                    <DeleteOutlined style={{ color: "#b20900", fontSize: "20px" }} key="delete" />
                  </Popconfirm>
                ),
              ]}
            >
              <div className="flex gap-10">
                <div className="flex flex-1 flex-col items-center">
                  <img
                    src={`${apiHost}/public/${product.qr_code}`}
                    alt="QR code"
                    className="w-24 h-24 object-contain bg-white p-1"
                  />
                  <p className="text-sm font-semibold mt-2">{product.product_code}</p>
                </div>
                <div className="flex flex-1 flex-col justify-between w-full">
                  <p className="text-lg font-semibold">{product.product_name}</p>
                  <p>₹ {product.product_price}</p>
                  <p><b>Qty:</b> {product.product_quantity} gm</p>
                  {state.editing ? (
                    <>
                      <DatePicker placeholder="Packed Date" onChange={(d, ds) => handleDateChange(product.id, "pkd", d, ds)} className="mb-2" style={{ width: "100%" }} />
                      <DatePicker placeholder="Expiry Date" onChange={(d, ds) => handleDateChange(product.id, "exp", d, ds)} style={{ width: "100%" }} />
                    </>
                  ) : (
                    <>
                      <p><b>Pkd:</b> {state.pkd || "--"}</p>
                      <p><b>Exp:</b> {state.exp || "--"}</p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal for sticker */}
      <Modal
        title="Print Sticker"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedProduct && (
          <>
            <div
              ref={previewRef}
              style={{
                width: 180,
                padding: 7,
                textAlign: "center",
                border: "1px dashed gray",
                margin: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <div className="flex-col items-center justify-center gap-4">
                <img
                  crossOrigin="anonymous"
                  src={`${apiHost}/public/${selectedProduct.qr_code}`}
                  alt="QR"
                  style={{ width: 40, height: 50 }}
                />
                <p>{selectedProduct.product_code}</p>
              </div>
              <div className="">
                <b>Hunny Bunny🐝</b>
                <h4>{selectedProduct.product_name}</h4>
                <p>₹ {selectedProduct.product_price}</p>
                <p>{selectedProduct.product_quantity} gm</p>
              </div>
            </div>

            <Input
              type="number"
              min={1}
              value={stickerCount}
              onChange={(e) => setStickerCount(Number(e.target.value))}
              placeholder="Enter number of stickers"
              style={{ marginTop: 16 }}
            />
            <Button
              icon={<PrinterOutlined />}
              type="primary"
              onClick={generatePDFPreview}
              style={{ marginTop: 16, width: "100%" }}
            >
              Print Preview
            </Button>
          </>
        )}
      </Modal>
    </>
  );
};

export default Products;
