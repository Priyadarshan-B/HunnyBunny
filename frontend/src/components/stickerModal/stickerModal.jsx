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

    const stickerWrapper = document.createElement("div");
    stickerWrapper.style.position = "absolute";
    stickerWrapper.style.right = "-9999px";
    stickerWrapper.style.top = "0";
    document.body.appendChild(stickerWrapper);

    for (let i = 0; i < stickerCount; i++) {
      const clone = input.cloneNode(true);
      clone.style.margin = "2";   //value changed from 0 to 2
      clone.style.display = "inline-block";
      stickerWrapper.appendChild(clone);
    }

    // Set sticker dimensions in mm
    const stickerWidth = 50; // mm (True-Ally size)
    const stickerHeight = 25; // mm
    const stickersPerRow = 2;

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < stickerCount; i++) {
      const singleStickerCanvas = await html2canvas(input, {
        useCORS: true,
        scale: 2,
      });
      const stickerImage = singleStickerCanvas.toDataURL("image/png");

      const px = (i % stickersPerRow) * stickerWidth;
      const py =
        (Math.floor(i / stickersPerRow) %
          Math.floor(pdfHeight / stickerHeight)) *
        stickerHeight;

      if (
        i > 0 &&
        i % (stickersPerRow * Math.floor(pdfHeight / stickerHeight)) === 0
      ) {
        pdf.addPage();
      }

      pdf.addImage(stickerImage, "PNG", px, py, stickerWidth, stickerHeight);
    }

    document.body.removeChild(stickerWrapper);
    pdf.output("dataurlnewwindow");
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
              width: 189,
              height: 94,
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
            <div className="flex flex-row gap-2 justify-center items-center">
              <div className="flex-1 flex-col items-center justify-center gap-2">
                <img
                  crossOrigin="anonymous"
                  src={`${apiHost}/public/${product.qr_code}`}
                  alt="QR"
                  style={{ width: 50, height: 50 }}
                />
                <p style={{ fontWeight: "bold", fontSize: "10px" }}>
                  {product.product_code}
                </p>
              </div>
              <div>
                <p style={{ fontWeight: "bold", fontSize: "10px" }}>
                  Hunny Bunny
                </p>
                <h4 style={{ fontWeight: "bold", fontSize: "10px" }}>
                  {product.product_name.toUpperCase()}
                </h4>
                <div className="flex flex-row-reverse gap-4 mt-1">
                  <div className="flex-1 flex-col">
                    <p style={{ fontWeight: "600", fontSize: "9px" }}>
                      MRP {product.product_price}
                    </p>
                    <p style={{ fontSize: "8px" }}>
                      {product.product_quantity} {editStates[product.id]?.qty}
                    </p>
                  </div>
                  <div className="flex flex-col align-middle">
                    <p style={{ fontWeight: "400", fontSize: "8px" }}>
                      pkd:{" "}
                      {editStates[product.id]?.pkd
                        ? dayjs(
                            editStates[product.id].pkd,
                            "DD-MM-YYYY"
                          ).format("DD-MM-YYYY")
                        : "--"}
                    </p>
                    <p style={{ fontWeight: "400", fontSize: "8px" }}>
                      exp:{" "}
                      {editStates[product.id]?.exp
                        ? dayjs(
                            editStates[product.id].exp,
                            "DD-MM-YYYY"
                          ).format("DD-MM-YYYY")
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
