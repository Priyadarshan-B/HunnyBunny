import React, { useRef, useEffect } from "react";
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
      clone.style.margin = "0";
      clone.style.display = "inline-block";
      stickerWrapper.appendChild(clone);
    }

    const stickerWidth = 105;
    const stickerHeight = 50;
    const stickersPerRow = 2;

    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < stickerCount; i++) {
        // Clone the sticker
      const singleStickerCanvas = await html2canvas(input, {
        useCORS: true,
        scale: 2,
      });
      const stickerImage = singleStickerCanvas.toDataURL("image/png");

    //   Calculate position for each sticker
      const px = (i % stickersPerRow) * stickerWidth;
      const py =
        (Math.floor(i / stickersPerRow) %
          Math.floor(pdfHeight / stickerHeight)) *
        stickerHeight;

        // New page if needed
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
              width: 200,
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
                  <p className="font-bold">{product.product_code}</p>
                </div>
                <div>
                  <b>Hunny Bunny🐝</b>
                  <h4 className="font-bold">{product.product_name.toUpperCase()}</h4>
                  <div className="flex flex-row-reverse gap-2 mt-1">
                      <div className="flex-1 flex-col">
                          <p className="font-semibold text-sm">MRP {product.product_price}</p>
                          <p className="text-xs">{product.product_quantity} gm</p>
                      </div>
                      <div className="flex-1 flex-col ">
                          <p className="font-semibold text-xs">
                            pkd:{" "}
                            {editStates[product.id]?.pkd
                              ? dayjs(editStates[product.id].pkd, "DD-MM-YYYY").format("DD-MM-YYYY")
                              : "--"}
                          </p>
                          <p className="font-semibold text-xs">
                            exp:{" "}
                            {editStates[product.id]?.exp
                              ? dayjs(editStates[product.id].exp ,"DD-MM-YYYY").format("DD-MM-YYYY")
                              : "--"}
                          </p>
                      </div>
                  </div>
                </div>
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
  );
};

export default StickerModal;
