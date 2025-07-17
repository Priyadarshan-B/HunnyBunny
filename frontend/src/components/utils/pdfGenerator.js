import jsPDF from "jspdf";
import { toWords } from "number-to-words";

const generatePDF = (products, totalAmount, customerName) => {
  const lineHeight = 12;
  const headerLines = 9;
  const footerLines = 12;
  const productLines = products.length;
  const contentLines = headerLines + productLines + footerLines;

  // 12pt line height * total lines + extra 60pt buffer
  const pageHeight = contentLines * lineHeight + 50;

  const doc = new jsPDF({
    unit: "pt",
    format: [180, pageHeight],
  });

  const startX = 6; // reduced for narrower page
  const centerX = 90; // 180 / 2
  let y = 18; // slightly reduced for smaller font

  doc.setFont("Courier", "bold");
  doc.setFontSize(11); // reduced from 13
  doc.text("HUNNY BUNNY", centerX, y, { align: "center" });
  doc.setFontSize(9);
  y += 10;
  doc.text("CAKES & SWEETS", centerX, y, { align: "center" });

  y += 13;

  doc.setFontSize(8); // reduced from 9
  doc.text("TIRUCHENGODE ROAD CORNER", centerX, y, { align: "center" });
  y += 10;
  doc.text("NAMAKKAL - 637001", centerX, y, { align: "center" });
  y += 10;
  doc.text("Ph: 9443385035, 9585541355", centerX, y, { align: "center" });
  y += 10;
  doc.text("--------------------------------------", centerX, y, {
    align: "center",
  });
  y += 10;
  doc.text(`Name: ${customerName}`, startX, y);
  y += 10;

  const date = new Date();
  doc.text(`Date: ${date.toLocaleDateString()}`, startX, y);
  doc.text(`Time: ${date.toLocaleTimeString()}`, startX + 80, y);
  y += 10;
  doc.text("------------------------------------------", centerX, y, {
    align: "center",
  });
  y += 10;

  doc.setFont("Courier", "bold");
  doc.text("Particulars    Qty    Rate    Amount", startX, y);
  y += 9;
  doc.setFont("Courier", "normal");

  // Column positions
  const nameColWidth = 60; // width for product name
  const qtyColX = startX + 80;
  const rateColX = startX + 130;
  const amountColX = startX + 170;

  products.forEach((p) => {
    // Wrap the product name
    const nameLines = doc.splitTextToSize(p.name, nameColWidth);

    // Prepare other columns
    const qty = p.quantity.toString();
    const rate = p.price.toFixed(2);
    const amount = (p.price * p.quantity).toFixed(2);

    // Print each line
    nameLines.forEach((line, idx) => {
      doc.text(line, startX, y);
      if (idx === 0) {
        // Only print qty, rate, amount on the first line
        doc.text(qty, qtyColX, y, { align: "right" });
        doc.text(rate, rateColX, y, { align: "right" });
        doc.text(amount, amountColX, y, { align: "right" });
      }
      y += 10;
    });
  });

  y += 4;
  doc.text(`Qty : ${products.reduce((s, p) => s + p.quantity, 0)}`, startX, y);
  y += 10;

  doc.text(`Items : ${products.length}`, startX, y);
  doc.text(`Total Amt : ${totalAmount.toFixed(2)}`, startX + 70, y); // moved closer
  y += 10;

  doc.text("Round off : 0.00", startX, y);
  y += 10;
  doc.text("---------------------------------------", centerX, y, {
    align: "center",
  });
  y += 10;

  doc.text("N E T   A M O U N T", centerX, y, { align: "center" });
  y += 10;

  doc.setFont("Courier", "bold");
  doc.text(`INR ${totalAmount.toFixed(2)}`, centerX, y, { align: "center" });
  y += 10;

  const totalRupees = Math.floor(totalAmount);
  const totalPaise = Math.round((totalAmount - totalRupees) * 100);

  let amountInWords = `Rupees ${toWords(totalRupees)}`;
  if (totalPaise > 0) {
    amountInWords += ` and ${toWords(totalPaise)} Paise`;
  }
  amountInWords += " Only";

  doc.setFontSize(7); // reduced from 8
  doc.text(`(${amountInWords})`, centerX, y, { align: "center" });
  y += 10;

  doc.setFont("Courier", "normal");
  doc.text("-------------------------------------------", centerX, y, {
    align: "center",
  });
  y += 12;

  doc.setFont("Courier", "normal");
  doc.setFontSize(6);
  doc.text("UNIT OF SRI SAKTHI BAKERY, SWEETS & SNACKS", centerX, y, {
    align: "center",
  });
  y += 10;

  doc.setFont("Courier", "bold");
  doc.text("!! Thanks !!! Visit Again !!", centerX, y, { align: "center" });
  y += 10;

  doc.setFont("Courier", "normal");
  doc.text("For Order & Enquiry", centerX, y, { align: "center" });
  y += 10;
  doc.text("Call us on 9443385035", centerX, y, { align: "center" });

  return doc;
};

export default generatePDF;
