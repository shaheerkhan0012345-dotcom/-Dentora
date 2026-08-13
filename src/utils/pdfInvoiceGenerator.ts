import jsPDF from 'jspdf';
import { InvoiceRecord } from '../types/financial';

export function generateInvoicePDF(invoice: InvoiceRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [29, 91, 216]; // #1d5bd8
  const darkColor = [15, 23, 42]; // #0f172a
  const grayColor = [100, 116, 139]; // #64748b
  const lightBg = [248, 250, 252]; // #f8fafc

  // 1. TOP BRANDING BAR
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 8, 'F');

  // CLINIC LOGO / HEADER
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('TEETHLY DENTAL CLINIC', 14, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('AI-POWERED DENTAL CARE & IMPLANT CENTER', 14, 27);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('104 Healthcare Blvd, Suite 300 • Islamabad / Lahore', 14, 32);
  doc.text('Tel: +92 (51) 889-2210 • Email: billing@teethlyclinic.com • Tax ID: PK-998822', 14, 36);

  // INVOICE BADGE & STATUS
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(135, 14, 61, 26, 3, 3, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('INVOICE', 140, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(`Invoice #: ${invoice.invoiceNo}`, 140, 28);
  doc.text(`Date: ${invoice.invoiceDate}`, 140, 33);

  // Status Badge
  const statusUpper = invoice.paymentStatus.toUpperCase();
  doc.setFont('helvetica', 'bold');
  if (invoice.paymentStatus === 'Paid') {
    doc.setTextColor(16, 185, 129); // emerald
  } else if (invoice.paymentStatus === 'Partially Paid') {
    doc.setTextColor(245, 158, 11); // amber
  } else {
    doc.setTextColor(225, 29, 72); // rose
  }
  doc.text(`STATUS: ${statusUpper}`, 140, 38);

  // DIVIDER LINE
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);

  // 2. PATIENT & DOCTOR INFO BOXES
  let y = 48;

  // Billed To Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, 88, 28, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('BILLED TO (PATIENT)', 18, y + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(invoice.patientName, 18, y + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`Patient ID: ${invoice.patientId}`, 18, y + 17);
  if (invoice.patientPhone) {
    doc.text(`Phone: ${invoice.patientPhone}`, 18, y + 22);
  }

  // Doctor Info Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(108, y, 88, 28, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('ATTENDING CLINICIAN', 112, y + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(invoice.doctorName, 112, y + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`Due Date: ${invoice.dueDate}`, 112, y + 17);
  doc.text(`Payment Terms: Due upon receipt`, 112, y + 22);

  // 3. TREATMENT / SERVICE BREAKDOWN TABLE
  y = 82;

  // Table Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('#', 18, y + 5.5);
  doc.text('TREATMENT / SERVICE DESCRIPTION', 30, y + 5.5);
  doc.text('QTY', 125, y + 5.5);
  doc.text('UNIT PRICE', 145, y + 5.5);
  doc.text('TOTAL', 175, y + 5.5);

  y += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

  invoice.items.forEach((item, index) => {
    // Alternating background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, y, 182, 8, 'F');
    }

    doc.text((index + 1).toString(), 18, y + 5.5);
    doc.text(item.description.substring(0, 50), 30, y + 5.5);
    doc.text(item.quantity.toString(), 127, y + 5.5);
    doc.text(`$${item.unitPrice.toFixed(2)}`, 145, y + 5.5);
    doc.text(`$${item.totalPrice.toFixed(2)}`, 175, y + 5.5);

    y += 8;
  });

  // Bottom line of table
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);

  // 4. TOTALS & FINANCIAL SUMMARY
  y += 6;

  // Notes Box on left
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 100, 36, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('CLINICAL & PAYMENT NOTES:', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  const splitNotes = doc.splitTextToSize(invoice.notes || 'Thank you for choosing Teethly Dental Clinic. Please keep this invoice for insurance and tax purposes.', 92);
  doc.text(splitNotes, 18, y + 11);

  // Calculation Breakdown on right
  let rightY = y;
  const colLeft = 125;
  const colRight = 180;

  const addSummaryRow = (label: string, valueStr: string, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 9.5 : 8.5);
    doc.setTextColor(isBold ? darkColor[0] : grayColor[0], isBold ? darkColor[1] : grayColor[1], isBold ? darkColor[2] : grayColor[2]);
    doc.text(label, colLeft, rightY + 5);
    doc.text(valueStr, colRight, rightY + 5);
    rightY += 6;
  };

  addSummaryRow('Subtotal:', `$${invoice.subtotal.toFixed(2)}`);
  if (invoice.discount > 0) {
    addSummaryRow('Discount:', `-$${invoice.discount.toFixed(2)}`);
  }
  if (invoice.tax > 0) {
    addSummaryRow(`Tax (${invoice.taxRate || 0}%):`, `+$${invoice.tax.toFixed(2)}`);
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(colLeft, rightY + 1, 196, rightY + 1);
  rightY += 3;

  addSummaryRow('GRAND TOTAL:', `$${invoice.grandTotal.toFixed(2)}`, true);
  addSummaryRow('Paid Amount:', `$${invoice.paidAmount.toFixed(2)}`);

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(colLeft - 2, rightY + 2, 73, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('REMAINING BALANCE DUE:', colLeft, rightY + 7);
  doc.text(`$${invoice.remainingBalance.toFixed(2)}`, colRight, rightY + 7);

  // 5. SIGNATURE & QR VERIFICATION STAMP
  const stampY = Math.max(y + 45, rightY + 20);

  // QR Code box placeholder
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, stampY, 22, 22, 'FD');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('VERIFIED', 18, stampY + 9);
  doc.text('TEETHLY', 18, stampY + 13);
  doc.text('DIGITAL', 18, stampY + 17);

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(8);
  doc.text('Scan with Teethly Mobile App', 40, stampY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('To view your 3D Dental Chart, Prescriptions & Post-Op Guidelines.', 40, stampY + 15);

  // Doctor Signature Line
  doc.setDrawColor(100, 116, 139);
  doc.line(130, stampY + 15, 190, stampY + 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('AUTHORIZED SIGNATURE & STAMP', 130, stampY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(invoice.doctorName, 130, stampY + 23);

  // 6. FOOTER PAGE NUMBER
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text('Teethly Clinic Management System • Computer Generated Official Medical Invoice', 105, 287, { align: 'center' });

  // Save PDF
  doc.save(`${invoice.invoiceNo}_Teethly_Invoice.pdf`);
}
