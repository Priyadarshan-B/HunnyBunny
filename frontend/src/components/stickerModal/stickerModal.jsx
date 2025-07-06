import React, { useRef } from "react";
import { Modal, Input, Button } from "antd";
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

  const generatePDFPreview = async () => {
    const input = previewRef.current;
    if (!input) return;

    const stickerWidth = 50; // mm
    const stickerHeight = 25; // mm
    const gapY = 4.5; // vertical gap between rows
    const stickersPerRow = 2;

    const totalRows = Math.ceil(stickerCount / stickersPerRow);
    const pageWidth = stickerWidth * stickersPerRow; // 100mm
    const pageHeight = totalRows * stickerHeight + (totalRows - 1) * gapY;

    const pdf = new jsPDF({
      unit: "mm",
      format: [pageWidth, pageHeight],
    });

    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "absolute";
    hiddenContainer.style.top = "-9999px";
    hiddenContainer.style.left = "0";
    hiddenContainer.style.width = `${stickerWidth}mm`;
    hiddenContainer.style.height = `${stickerHeight}mm`;
    document.body.appendChild(hiddenContainer);

    for (let i = 0; i < stickerCount; i++) {
      const clone = input.cloneNode(true);
      clone.style.margin = "0";
      clone.style.padding = "0";
      clone.style.width = "189px"; // for consistent render
      clone.style.height = "94px";
      clone.style.boxSizing = "border-box";
      clone.style.border = "none";

      hiddenContainer.appendChild(clone);
      await new Promise((res) => setTimeout(res, 50)); // allow DOM update

      const canvas = await html2canvas(clone, {
        useCORS: true,
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");

      const row = Math.floor(i / stickersPerRow);
      const col = i % stickersPerRow;

      const x = col * stickerWidth;
      const y = row * (stickerHeight + gapY);

      pdf.addImage(imgData, "PNG", x, y, stickerWidth, stickerHeight);

      hiddenContainer.removeChild(clone);
    }

    document.body.removeChild(hiddenContainer);
    pdf.output("dataurlnewwindow");
  };

  return (
    <Modal title="Print Sticker" open={visible} onCancel={onClose} footer={null} width={600}>
      {product && (
        <>
          <div
            ref={previewRef}
            style={{
              width: 189,
              height: 94,
              padding: 7,
              textAlign: "center",
              border: "1px solid lightgray",
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
                <p style={{ fontWeight: "bold", fontSize: "10px" }}>{product.code}</p>
              </div>
              <div>
                <p style={{ fontWeight: "bold", fontSize: "10px" }}>Hunny Bunny</p>
                <h4 style={{ fontWeight: "bold", fontSize: "10px" }}>{product.name.toUpperCase()}</h4>
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
                        ? dayjs(editStates[product.id].pkd, "DD-MM-YYYY").format("DD-MM-YYYY")
                        : "--"}
                    </p>
                    <p style={{ fontWeight: "400", fontSize: "8px" }}>
                      exp:{" "}
                      {editStates[product.id]?.exp
                        ? dayjs(editStates[product.id].exp, "DD-MM-YYYY").format("DD-MM-YYYY")
                        : "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Input
            type="number"
            min={2}
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
  );
};

export default StickerModal;
