import jsPDF from "jspdf";
import { toWords } from "number-to-words";

const generatePDF = (products, totalAmount) => {
  const doc = new jsPDF({ unit: "pt", format: [226.77, 1000] });
  const startX = 10;
  let y = 20;

  doc.setFont("Courier", "bold");
  doc.setFontSize(13);
  doc.text("HUNNY BUNNY", 113, y, { align: "center" });
  y += 15;
  doc.setFontSize(9);
  doc.text("TIRUCHENGODE ROAD CORNER", 113, y, { align: "center" });
  y += 12;
  doc.text("NAMAKKAL - 637001", 113, y, { align: "center" });
  y += 12;
  doc.text("Ph: 9443385035, 9585541355", 113, y, { align: "center" });
  y += 12;
  doc.text("------------------------------------------", 113, y, {
    align: "center",
  });
  y += 12;

  const date = new Date();
  doc.text(`Date: ${date.toLocaleDateString()}`, startX, y);
  doc.text(`Time: ${date.toLocaleTimeString()}`, 130, y);
  y += 12;
  doc.text("------------------------------------------", 113, y, {
    align: "center",
  });
  y += 12;

  doc.setFont("Courier", "bold");
  doc.text("Particulars      Qty    Rate     Amount", startX, y);
  y += 10;
  doc.setFont("Courier", "normal");

  products.forEach((p) => {
    const name =
      p.name.length > 14 ? p.name.substring(0, 14) : p.name.padEnd(14, " ");
    const qty = p.quantity.toString().padStart(4, " ");
    const rate = p.price.toFixed(2).padStart(8, " ");
    const amount = (p.price * p.quantity).toFixed(2).padStart(9, " ");
    doc.text(`${name} ${qty} ${rate} ${amount}`, startX, y);
    y += 12;
  });

  y += 5;
  doc.text(`Qty : ${products.reduce((s, p) => s + p.quantity, 0)}`, startX, y);
  y += 12;

  doc.text(`Items : ${products.length}`, startX, y);
  //   y += 12;

  doc.text(`Total Amt : ${totalAmount.toFixed(2)}`, startX + 100, y);
  y += 12;

  doc.text(`Round off : 0.00`, startX, y);
  y += 12;
  doc.text("-----------------------------", 113, y, { align: "center" });
  y += 12;
  doc.text("N E T   A M O U N T", 113, y, { align: "center" });
  y += 12;
  doc.setFont("Courier", "bold");
  doc.text(`INR ${totalAmount.toFixed(2)}`, 113, y, { align: "center" });
  y += 12;
  const totalRupees = Math.floor(totalAmount);
  const totalPaise = Math.round((totalAmount - totalRupees) * 100);

  let amountInWords = `Rupees ${toWords(totalRupees)}`;
  if (totalPaise > 0) {
    amountInWords += ` and ${toWords(totalPaise)} Paise`;
  }
  amountInWords += " Only";
doc.setFontSize(8)
  doc.text(`(${amountInWords})`, 113, y, { align: "center" });
//   doc.text(`( Rupees ${totalAmount.toFixed(2)} Only )`, 113, y, {
//     align: "center",
//   });
  y += 12;
  doc.setFont("Courier", "normal");

  doc.text("-----------------------------", 113, y, { align: "center" });
  y += 15;

  doc.setFont("Courier", "normal");
  doc.setFontSize(8);
  doc.text("UNIT OF SRI SAKTHI BAKERY, SWEETS & SNACKS", 110, y, {
    align: "center",
  });
  y += 12;
  doc.setFont("Courier", "bold");
  doc.text("!! Thanks !!! Visit Again !!", 113, y, { align: "center" });
  y += 12;
  doc.setFont("Courier", "normal");
  doc.text("For Order & Enquiry", 113, y, { align: "center" });
  y += 12;
  doc.text("Call us on 9443385035", 113, y, { align: "center" });

  return doc;
};

export default generatePDF;
