import PDFDocument from "pdfkit";

// GST rates by product type (as per Sept 2025 reforms)
const GST_RATES: Record<string, number> = {
  CORRECTIVE_LENS: 5,
  CONTACT_LENS: 5,
  FRAME: 18,
  SUNGLASSES: 12,
  SAFETY_GOGGLES: 12,
  DEFAULT: 12, // Average for mixed products
};

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number; // Price per unit (inclusive of GST)
  gstRate?: number;
}

interface InvoiceAddress {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal: string;
  country: string;
}

interface InvoiceData {
  orderId: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  address: InvoiceAddress;
  items: InvoiceItem[];
  subtotal: number; // Total before discount (inclusive of GST)
  discount: number;
  shipping: number;
  finalAmount: number;
  couponCode?: string | null;
}

// Company details - ideally from env
const COMPANY = {
  name: "Veracious Eyewear Pvt. Ltd.",
  address: "123 Business Park, Sector 18",
  city: "Gurugram, Haryana - 122001",
  gstin: "06AAACV1234A1Z5", // Placeholder
  email: "orders@veracious.in",
  phone: "+91 98765 43210",
};

/**
 * Calculate GST breakdown from inclusive price
 * Formula: Base = Inclusive / (1 + rate/100), GST = Inclusive - Base
 */
function calculateGSTBreakdown(inclusivePrice: number, gstRate: number) {
  const basePrice = inclusivePrice / (1 + gstRate / 100);
  const gstAmount = inclusivePrice - basePrice;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  return { basePrice, gstAmount, cgst, sgst, gstRate };
}

/**
 * Generate invoice number from order ID
 */
function generateInvoiceNumber(orderId: string): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const shortId = orderId.slice(-6).toUpperCase();
  return `INV-${year}${month}-${shortId}`;
}

/**
 * Format currency in INR
 */
function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/**
 * Generate PDF invoice and return as Buffer
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const invoiceNumber = generateInvoiceNumber(data.orderId);
      const invoiceDate = data.orderDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // ===== HEADER =====
      doc.fontSize(20).font("Helvetica-Bold").text(COMPANY.name, 50, 50);
      doc.fontSize(9).font("Helvetica").fillColor("#666666");
      doc.text(COMPANY.address, 50, 75);
      doc.text(COMPANY.city, 50, 87);
      doc.text(`GSTIN: ${COMPANY.gstin}`, 50, 99);
      doc.text(`Email: ${COMPANY.email} | Phone: ${COMPANY.phone}`, 50, 111);

      // Tax Invoice title
      doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold");
      doc.text("TAX INVOICE", 400, 50, { width: 150, align: "right" });

      // Invoice details box
      doc.fontSize(10).font("Helvetica");
      doc.text(`Invoice No: ${invoiceNumber}`, 400, 75, { width: 150, align: "right" });
      doc.text(`Date: ${invoiceDate}`, 400, 90, { width: 150, align: "right" });
      doc.text(`Order ID: ${data.orderId.slice(-8).toUpperCase()}`, 400, 105, { width: 150, align: "right" });

      // Line
      doc.moveTo(50, 135).lineTo(545, 135).stroke("#cccccc");

      // ===== BILLING DETAILS =====
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#000000");
      doc.text("Bill To:", 50, 150);
      doc.fontSize(10).font("Helvetica");
      doc.text(data.customerName, 50, 168);
      doc.text(data.customerEmail, 50, 183);
      doc.text(data.address.line1, 50, 198);
      if (data.address.line2) doc.text(data.address.line2, 50, 213);
      const addressY = data.address.line2 ? 228 : 213;
      doc.text(`${data.address.city}, ${data.address.state} - ${data.address.postal}`, 50, addressY);
      doc.text(data.address.country, 50, addressY + 15);

      // ===== ITEMS TABLE =====
      const tableTop = 280;
      const tableHeaders = ["Item", "HSN", "Qty", "Base Price", "GST%", "GST Amt", "Total"];
      const colWidths = [170, 50, 35, 70, 40, 60, 70];
      let xPos = 50;

      // Table header
      doc.fillColor("#f0f0f0").rect(50, tableTop, 495, 20).fill();
      doc.fillColor("#000000").fontSize(9).font("Helvetica-Bold");
      xPos = 50;
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPos + 5, tableTop + 5, { width: colWidths[i] - 10 });
        xPos += colWidths[i];
      });

      // Table rows
      let yPos = tableTop + 25;
      let totalBasePrice = 0;
      let totalGST = 0;

      doc.font("Helvetica").fontSize(9);

      data.items.forEach((item) => {
        const gstRate = item.gstRate || GST_RATES.DEFAULT;
        const lineTotal = item.price * item.quantity;
        const breakdown = calculateGSTBreakdown(lineTotal, gstRate);

        totalBasePrice += breakdown.basePrice;
        totalGST += breakdown.gstAmount;

        xPos = 50;
        doc.fillColor("#333333");

        // Item name (truncate if too long)
        const itemName = item.name.length > 30 ? item.name.slice(0, 27) + "..." : item.name;
        doc.text(itemName, xPos + 5, yPos, { width: colWidths[0] - 10 });
        xPos += colWidths[0];

        doc.text("9004", xPos + 5, yPos, { width: colWidths[1] - 10 }); // HSN code for eyewear
        xPos += colWidths[1];

        doc.text(item.quantity.toString(), xPos + 5, yPos, { width: colWidths[2] - 10 });
        xPos += colWidths[2];

        doc.text(formatCurrency(breakdown.basePrice), xPos + 5, yPos, { width: colWidths[3] - 10 });
        xPos += colWidths[3];

        doc.text(`${gstRate}%`, xPos + 5, yPos, { width: colWidths[4] - 10 });
        xPos += colWidths[4];

        doc.text(formatCurrency(breakdown.gstAmount), xPos + 5, yPos, { width: colWidths[5] - 10 });
        xPos += colWidths[5];

        doc.text(formatCurrency(lineTotal), xPos + 5, yPos, { width: colWidths[6] - 10 });

        yPos += 18;

        // Add line separator
        doc.moveTo(50, yPos - 3).lineTo(545, yPos - 3).stroke("#eeeeee");
      });

      // ===== TOTALS SECTION =====
      yPos += 15;
      const totalsX = 350;

      // Subtotal
      doc.font("Helvetica").fontSize(10);
      doc.text("Subtotal (excl. GST):", totalsX, yPos);
      doc.text(formatCurrency(totalBasePrice), 480, yPos, { width: 65, align: "right" });
      yPos += 18;

      // GST breakdown - show CGST & SGST
      doc.text(`CGST (${GST_RATES.DEFAULT / 2}%):`, totalsX, yPos);
      doc.text(formatCurrency(totalGST / 2), 480, yPos, { width: 65, align: "right" });
      yPos += 15;

      doc.text(`SGST (${GST_RATES.DEFAULT / 2}%):`, totalsX, yPos);
      doc.text(formatCurrency(totalGST / 2), 480, yPos, { width: 65, align: "right" });
      yPos += 18;

      // Subtotal with GST
      doc.text("Subtotal (incl. GST):", totalsX, yPos);
      doc.text(formatCurrency(data.subtotal), 480, yPos, { width: 65, align: "right" });
      yPos += 15;

      // Discount
      if (data.discount > 0) {
        doc.fillColor("#008000");
        doc.text(`Discount${data.couponCode ? ` (${data.couponCode})` : ""}:`, totalsX, yPos);
        doc.text(`-${formatCurrency(data.discount)}`, 480, yPos, { width: 65, align: "right" });
        yPos += 15;
        doc.fillColor("#000000");
      }

      // Shipping
      doc.text("Shipping:", totalsX, yPos);
      doc.text(data.shipping === 0 ? "FREE" : formatCurrency(data.shipping), 480, yPos, { width: 65, align: "right" });
      yPos += 20;

      // Grand Total
      doc.moveTo(totalsX, yPos).lineTo(545, yPos).stroke("#cccccc");
      yPos += 8;
      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Grand Total:", totalsX, yPos);
      doc.text(formatCurrency(data.finalAmount), 480, yPos, { width: 65, align: "right" });

      // ===== FOOTER =====
      const footerY = 750;
      doc.font("Helvetica").fontSize(8).fillColor("#666666");
      doc.text("This is a computer-generated invoice and does not require a signature.", 50, footerY, {
        width: 495,
        align: "center",
      });
      doc.text("Thank you for shopping with Veracious!", 50, footerY + 12, { width: 495, align: "center" });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export { GST_RATES, calculateGSTBreakdown, generateInvoiceNumber };
