import React, { useRef } from "react";
import { Modal, Input, Button, Select } from "antd";
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

    const inchToMm = 25.4;
    const stickerWidth = 2 * inchToMm; // 50.8 mm
    const stickerHeight = 1 * inchToMm; // 25.4 mm
    const gapY = 6; // vertical gap in mm
    const pageWidth = 4.5 * inchToMm; // 114.3 mm

    const stickersPerRow = Math.floor(pageWidth / stickerWidth); // should be 2
    const totalRows = Math.ceil(stickerCount / stickersPerRow);
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
      clone.style.width = `${stickerWidth * 3.78}px`; // mm to px
      clone.style.height = `${stickerHeight * 3.78}px`;
      clone.style.boxSizing = "border-box";
      clone.style.border = "none";

      hiddenContainer.appendChild(clone);
      await new Promise((res) => setTimeout(res, 50));

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

          <Select
            value={stickerCount}
            onChange={setStickerCount}
            placeholder="Select number of stickers"
            style={{ marginTop: 16, width: "100%" }}
          >
            {[...Array(10)].map((_, i) => {
              const value = (i + 1) * 4;
              return (
                <Select.Option key={value} value={value}>
                  {value}
                </Select.Option>
              );
            })}
          </Select>

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

// import React, { useRef } from "react";
// import { Modal, Input, Button } from "antd";
// import { PrinterOutlined } from "@ant-design/icons";
// import dayjs from "dayjs";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import apiHost from "../../components/utils/api";
// import { toWords } from "number-to-words";

// const StickerModal = ({
//   visible,
//   product,
//   onClose,
//   stickerCount,
//   setStickerCount,
//   editStates,
// }) => {
//   const previewRef = useRef(null);

//   const generatePDFPreview = async () => {
//     const input = previewRef.current;
//     if (!input) return;

//     const stickerWrapper = document.createElement("div");
//     stickerWrapper.style.position = "absolute";
//     stickerWrapper.style.right = "-9999px";
//     stickerWrapper.style.top = "0";
//     document.body.appendChild(stickerWrapper);

//     const stickerWidth = 50; // mm
//     const stickerHeight = 25; // mm
//     const gap = 3; // mm between stickers (both horizontal and vertical)
//     const stickersPerRow = 2;

//     const totalRows = Math.ceil(stickerCount / stickersPerRow);
//     const rowHeight = stickerHeight + gap;
//     const pageHeight = totalRows * rowHeight;
//     const pageWidth = (stickerWidth * stickersPerRow) + gap; // 50 + 3 + 50 = 103mm

//     const pdf = new jsPDF({
//       unit: "mm",
//       format: [pageWidth, pageHeight],
//     });

//     for (let i = 0; i < stickerCount; i++) {
//       const clone = input.cloneNode(true);
//       clone.style.margin = "0";
//       clone.style.display = "inline-block";
//       stickerWrapper.appendChild(clone);

//       await new Promise((resolve) => setTimeout(resolve, 50));

//       const canvas = await html2canvas(clone, {
//         useCORS: true,
//         scale: 2,
//       });

//       const imgData = canvas.toDataURL("image/png");

//       const row = Math.floor(i / stickersPerRow);
//       const col = i % stickersPerRow;

//       const x = col * (stickerWidth + gap);
//       const y = row * (stickerHeight + gap);

//       pdf.addImage(imgData, "PNG", x, y, stickerWidth, stickerHeight);
//       stickerWrapper.removeChild(clone);
//     }

//     document.body.removeChild(stickerWrapper);
//     pdf.output("dataurlnewwindow");
//   };

//   return (
//     <Modal
//       title="Print Sticker"
//       open={visible}
//       onCancel={onClose}
//       footer={null}
//       width={600}
//     >
//       {product && (
//         <>
//           <div
//             ref={previewRef}
//             style={{
//               width: 189,
//               height: 94,
//               padding: 7,
//               textAlign: "center",
//               border: "1px dashed gray",
//               margin: "0",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: 10,
//             }}
//           >
//             <div className="flex flex-row gap-2 justify-center items-center">
//               <div className="flex-1 flex-col items-center justify-center gap-2">
//                 <img
//                   crossOrigin="anonymous"
//                   src={`${apiHost}/public/${product.qr_code}`}
//                   alt="QR"
//                   style={{ width: 50, height: 50 }}
//                 />
//                 <p style={{ fontWeight: "bold", fontSize: "10px" }}>
//                   {product.code}
//                 </p>
//               </div>
//               <div>
//                 <p style={{ fontWeight: "bold", fontSize: "10px" }}>
//                   Hunny Bunny
//                 </p>
//                 <h4 style={{ fontWeight: "bold", fontSize: "10px" }}>
//                   {product.name.toUpperCase()}
//                 </h4>
//                 <div className="flex flex-row-reverse gap-4 mt-1">
//                   <div className="flex-1 flex-col">
//                     <p style={{ fontWeight: "600", fontSize: "9px" }}>
//                       MRP {product.price}
//                     </p>
//                     <p style={{ fontSize: "8px" }}>
//                       {product.product_quantity} {editStates[product.id]?.qty}
//                     </p>
//                   </div>
//                   <div className="flex flex-col align-middle">
//                     <p style={{ fontWeight: "400", fontSize: "8px" }}>
//                       pkd:{" "}
//                       {editStates[product.id]?.pkd
//                         ? dayjs(
//                           editStates[product.id].pkd,
//                           "DD-MM-YYYY"
//                         ).format("DD-MM-YYYY")
//                         : "--"}
//                     </p>
//                     <p style={{ fontWeight: "400", fontSize: "8px" }}>
//                       exp:{" "}
//                       {editStates[product.id]?.exp
//                         ? dayjs(
//                           editStates[product.id].exp,
//                           "DD-MM-YYYY"
//                         ).format("DD-MM-YYYY")
//                         : "--"}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <Input
//             type="number"
//             min={2}
//             value={stickerCount}
//             onChange={(e) => setStickerCount(Number(e.target.value))}
//             placeholder="Enter number of stickers"
//             style={{ marginTop: 16 }}
//           />
//           <Button
//             icon={<PrinterOutlined />}
//             type="primary"
//             onClick={generatePDFPreview}
//             style={{ marginTop: 16, width: "100%" }}
//           >
//             Print Preview
//           </Button>
//         </>
//       )}
//     </Modal>
//   );
// };

// export default StickerModal;
