import React, { useRef, useState } from "react";
import { Modal, Button, Select } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import apiHost from "../../components/utils/api";

const StickerModal = ({
  visible,
  product,
  onClose,
  stickerCount,
  setStickerCount,
  editStates,
}) => {
  const previewRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const generatePDFPreview = async () => {
    const input = previewRef.current;
    if (!input) return;

    setLoading(true);

    const inchToPx = 96;
    const stickerWidth = 2 * inchToPx; // 192px
    const stickerHeight = 1 * inchToPx; // 96px
    const gap = 24; // 0.25 inch
    const rowMargin = 12;

    const stickersPerRow = 2;
    const totalRows = Math.ceil(stickerCount / stickersPerRow);

    // Increase page width slightly if only 1 row (e.g., 4 stickers)
    const pageWidth =
      stickerCount <= stickersPerRow
        ? gap + stickerWidth * stickerCount + gap * (stickerCount + 1)
        : gap + stickersPerRow * stickerWidth + (stickersPerRow - 1) * gap + gap;

    const pageHeight =
      gap +
      totalRows * stickerHeight +
      (totalRows - 1) * gap +
      (totalRows - 1) * rowMargin +
      gap;

    const pdf = new jsPDF({
      unit: "px",
      format: [pageWidth, pageHeight],
    });

    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "absolute";
    hiddenContainer.style.top = "-9999px";
    hiddenContainer.style.left = "0";
    hiddenContainer.style.zIndex = "-1";
    document.body.appendChild(hiddenContainer);

    for (let i = 0; i < stickerCount; i++) {
      const clone = input.cloneNode(true);
      clone.style.margin = 0;
      clone.style.padding = 0;
      clone.style.width = `${stickerWidth}px`;
      clone.style.height = `${stickerHeight}px`;
      clone.style.boxSizing = "border-box";
      clone.style.background = "#fff";

      hiddenContainer.appendChild(clone);
      await new Promise((res) => setTimeout(res, 30));

      const canvas = await html2canvas(clone, {
        useCORS: true,
        scale: 3,
      });

      const imgData = canvas.toDataURL("image/png");

      const row = Math.floor(i / stickersPerRow);
      const col = i % stickersPerRow;

      const x = gap + col * (stickerWidth + gap);
      const y = gap + 13 + row * (stickerHeight + gap + rowMargin);

      pdf.addImage(imgData, "PNG", x, y, stickerWidth, stickerHeight);
      hiddenContainer.removeChild(clone);
    }

    document.body.removeChild(hiddenContainer);
    pdf.save(`${product.code}_stickers.pdf`);
    setLoading(false);
  };

  return (
    <Modal
      title="Print Sticker"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {product && (
        <>
          <div
            ref={previewRef}
            style={{
              width: 192,
              height: 96,
              padding: 10,
              textAlign: "center",
              margin: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
            }}
          >
            <div className="flex flex-row gap-2 justify-center items-center">
              <div className="flex-1 flex-col items-center justify-center gap-2">
                <img
                  crossOrigin="anonymous"
                  src={`${apiHost}/public/${product.qr_code}`}
                  alt="QR"
                  style={{ width: 50, height: 50 }}
                />
                <p style={{ fontWeight: "bold", fontSize: "10px" }}>
                  {product.code}
                </p>
              </div>
              <div>
                <p style={{ fontWeight: "bold", fontSize: "10px" }}>
                  Hunny Bunny
                </p>
                <h4 style={{ fontWeight: "bold", fontSize: "10px" }}>
                  {product.name.toUpperCase()}
                </h4>
                <div className="flex flex-row-reverse gap-4 mt-1">
                  <div className="flex-1 flex-col">
                    <p style={{ fontWeight: "600", fontSize: "9px" }}>
                      MRP {product.price}
                    </p>
                    <p style={{ fontSize: "8px" }}>
                      {product.product_quantity} {editStates[product.id]?.qty}
                    </p>
                  </div>
                  <div className="flex flex-col align-middle">
                    <p style={{ fontWeight: "400", fontSize: "8px" }}>
                      pkd:{" "}
                      {editStates[product.id]?.pkd
                        ? dayjs(editStates[product.id].pkd, "DD-MM-YYYY").format(
                            "DD-MM-YYYY"
                          )
                        : "--"}
                    </p>
                    <p style={{ fontWeight: "400", fontSize: "8px" }}>
                      exp:{" "}
                      {editStates[product.id]?.exp
                        ? dayjs(editStates[product.id].exp, "DD-MM-YYYY").format(
                            "DD-MM-YYYY"
                          )
                        : "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Select
            value={stickerCount}
            onChange={setStickerCount}
            style={{ marginTop: 16, width: "100%" }}
            options={Array.from({ length: 10 }, (_, i) => {
              const value = (i + 1) * 4;
              return { value, label: value };
            })}
            placeholder="Select number of stickers"
          />

          <Button
            icon={<PrinterOutlined />}
            type="primary"
            onClick={generatePDFPreview}
            loading={loading}
            disabled={loading}
            style={{ marginTop: 16, width: "100%" }}
          >
            {loading ? "Generating..." : "Print Preview"}
          </Button>
        </>
      )}
    </Modal>
  );
};

export default StickerModal;
