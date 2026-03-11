import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReceiptPDF = (receiptData, printSize = 'A4') => {
    console.log("Generating Receipt PDF for:", receiptData);
    return new Promise((resolve, reject) => {
        try {
            // Setup Format
            let pdfFormat = 'a4';
            let width = 210;
            let marginLeft = 15;

            if (printSize === 'A5') {
                pdfFormat = 'a5';
                width = 148;
                marginLeft = 10;
            } else if (printSize === 'Thermal') {
                pdfFormat = [80, 250]; // 80mm roll, estimated height
                width = 80;
                marginLeft = 5;
            }

            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: pdfFormat
            });

            const safeDate = (dateStr) => {
                try {
                    const d = dateStr ? new Date(dateStr) : new Date();
                    return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
                } catch (e) {
                    return new Date().toISOString().split('T')[0];
                }
            };

            // Format input data robustly
            const data = {
                receipt_number: receiptData.receipt_number || receiptData.receipt_no || `REC-${receiptData.receipt_id || '000'}`,
                date: receiptData.date || safeDate(receiptData.created_at),
                payment_method: receiptData.payment_method || 'Cash',
                generated_by: receiptData.generated_by || 'Admin',
                tx_ref: receiptData.transaction_ref || 'N/A',
                notes: receiptData.notes || '',
                client: {
                    name: receiptData.client_name || receiptData.client?.name || 'Unknown Client',
                    id: receiptData.client_id || receiptData.client?.id || 'N/A',
                    phone: receiptData.client_phone || receiptData.client?.phone || 'N/A',
                    email: receiptData.client_email || receiptData.client?.email || 'N/A',
                    address: receiptData.client_address || receiptData.client?.address || 'N/A',
                    gst: receiptData.client_gst || receiptData.client?.gst_number || 'N/A'
                },
                bill: {
                    number: receiptData.bill_number || 'N/A',
                    date: receiptData.bill_date || 'N/A',
                    orig_amount: parseFloat(receiptData.collection_amount || receiptData.collected_amount || 0) + parseFloat(receiptData.remaining_balance || 0),
                    paid: parseFloat(receiptData.collection_amount || receiptData.collected_amount || 0),
                    balance: parseFloat(receiptData.remaining_balance || 0)
                }
            };

            const isThermal = printSize === 'Thermal';

            /* ---- HEADER ---- */
            // Logo / Company Name
            doc.setFontSize(isThermal ? 16 : 22);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59); // Slate 800

            if (isThermal) {
                doc.text('HAB CREATION', width / 2, 12, { align: 'center' });
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 116, 139);
                doc.text('123 Business Avenue, Tech District', width / 2, 17, { align: 'center' });
                doc.text('+91 9876543210 | GST: 22AAAAA000', width / 2, 21, { align: 'center' });
            } else {
                doc.text('HAB CREATION', marginLeft, 20);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 116, 139); // Slate 500
                doc.text('123 Business Avenue', marginLeft, 26);
                doc.text('Tech District, City - 123456', marginLeft, 31);
                doc.text('Phone: +91 9876543210', marginLeft, 36);
                doc.text('GST: 22AAAAA0000A1Z5', marginLeft, 41);
            }

            // Receipt Title & Meta
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);

            let yMeta = isThermal ? 30 : 20;

            if (isThermal) {
                doc.setFontSize(14);
                doc.text('RECEIPT', width / 2, yMeta, { align: 'center' });
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.text(`No: ${data.receipt_number}`, width / 2, yMeta + 5, { align: 'center' });
                doc.text(`Date: ${data.date}`, width / 2, yMeta + 9, { align: 'center' });
                doc.text(`Payment: ${data.payment_method}`, width / 2, yMeta + 13, { align: 'center' });
            } else {
                doc.setFontSize(isThermal ? 16 : 24);
                doc.text('RECEIPT', width - marginLeft, yMeta, { align: 'right' });
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(71, 85, 105);
                doc.text(`Receipt No : ${data.receipt_number}`, width - marginLeft, yMeta + 7, { align: 'right' });
                doc.setFont('helvetica', 'normal');
                doc.text(`Date : ${data.date}`, width - marginLeft, yMeta + 12, { align: 'right' });
                doc.text(`Payment : ${data.payment_method}`, width - marginLeft, yMeta + 17, { align: 'right' });
            }

            let startY = isThermal ? yMeta + 20 : 50;

            /* ---- CLIENT INFO ---- */
            doc.setDrawColor(226, 232, 240); // Slate 200
            doc.setLineWidth(0.5);
            if (isThermal) {
                doc.line(marginLeft, startY, width - marginLeft, startY);
            } else {
                doc.line(marginLeft, startY - 2, width - marginLeft, startY - 2);
            }

            startY += 5;
            doc.setFontSize(isThermal ? 9 : 11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);

            if (isThermal) {
                doc.text('Billed To:', width / 2, startY, { align: 'center' });
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text(data.client.name, width / 2, startY + 5, { align: 'center' });
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(71, 85, 105);
                doc.text(`ID: ${data.client.id} | Ph: ${data.client.phone}`, width / 2, startY + 9, { align: 'center' });
                if (data.client.gst !== 'N/A') doc.text(`GST: ${data.client.gst}`, width / 2, startY + 13, { align: 'center' });
                startY += 17;
            } else {
                doc.text('Billed To', marginLeft, startY);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(data.client.name, marginLeft, startY + 6);

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(71, 85, 105);
                doc.text(`Client ID: ${data.client.id}`, marginLeft, startY + 11);
                doc.text(`Phone: ${data.client.phone}`, marginLeft, startY + 16);

                // Second column for client info if A4/A5
                let col2 = width / 2;
                if (data.client.email !== 'N/A') doc.text(`Email: ${data.client.email}`, col2, startY + 6);
                if (data.client.address !== 'N/A') doc.text(`Address: ${data.client.address}`, col2, startY + 11);
                if (data.client.gst !== 'N/A') doc.text(`GST: ${data.client.gst}`, col2, startY + 16);

                startY += 24;
            }

            /* ---- BILL TABLE ---- */
            let tableHead = isThermal
                ? [['Bill No', 'Paid']]
                : [['Bill Number', 'Original Amount', 'Paid Amount', 'Balance']];

            let tableBody = isThermal
                ? [[`#${data.bill.number}`, `Rs.${data.bill.paid.toLocaleString()}`]]
                : [[
                    `#${data.bill.number}`,
                    `Rs. ${data.bill.orig_amount.toLocaleString()}`,
                    `Rs. ${data.bill.paid.toLocaleString()}`,
                    `Rs. ${data.bill.balance.toLocaleString()}`
                ]];

            autoTable(doc, {
                startY: startY,
                head: tableHead,
                body: tableBody,
                theme: 'grid',
                headStyles: {
                    fillColor: [79, 70, 229], // Indigo 600
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: isThermal ? 8 : 10,
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: isThermal ? 8 : 10,
                    textColor: [51, 65, 85], // Slate 700
                    halign: 'center'
                },
                margin: { left: marginLeft, right: marginLeft },
                styles: { cellPadding: isThermal ? 2 : 4 }
            });

            let finalY = (doc).lastAutoTable.finalY + (isThermal ? 8 : 12);

            /* ---- PAYMENT SUMMARY ---- */
            doc.setFontSize(isThermal ? 9 : 11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42); // Slate 900

            if (isThermal) {
                doc.text('Payment Summary', width / 2, finalY, { align: 'center' });
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');

                finalY += 6;
                doc.text(`Total Bill: Rs.${data.bill.orig_amount.toLocaleString()}`, width / 2, finalY, { align: 'center' });
                doc.text(`Balance Left: Rs.${data.bill.balance.toLocaleString()}`, width / 2, finalY + 4, { align: 'center' });

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(79, 70, 229); // Indigo 600
                doc.text(`Collected: Rs.${data.bill.paid.toLocaleString()}`, width / 2, finalY + 10, { align: 'center' });

                finalY += 15;
            } else {
                let summaryX = width / 2; // Right half alignment
                let summaryLinesX2 = width - marginLeft;

                // Draw a nice box container for summary
                doc.setDrawColor(226, 232, 240);
                doc.setFillColor(248, 250, 252);
                doc.roundedRect(summaryX, finalY - 5, (width / 2) - marginLeft, 35, 3, 3, 'FD');

                doc.setFontSize(10);
                doc.setTextColor(71, 85, 105);
                doc.text('Total Bills Amount:', summaryX + 5, finalY + 2);
                doc.setTextColor(15, 23, 42);
                doc.text(`Rs. ${data.bill.orig_amount.toLocaleString()}`, summaryLinesX2 - 5, finalY + 2, { align: 'right' });

                doc.setTextColor(239, 68, 68); // Red 500
                doc.text('Remaining Balance:', summaryX + 5, finalY + 9);
                doc.text(`Rs. ${data.bill.balance.toLocaleString()}`, summaryLinesX2 - 5, finalY + 9, { align: 'right' });

                doc.setDrawColor(203, 213, 225);
                doc.line(summaryX + 5, finalY + 14, summaryLinesX2 - 5, finalY + 14);

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(79, 70, 229); // Indigo 600
                doc.text('Total Collected:', summaryX + 5, finalY + 22);
                doc.text(`Rs. ${data.bill.paid.toLocaleString()}`, summaryLinesX2 - 5, finalY + 22, { align: 'right' });

                finalY += 40;
            }

            /* ---- ADDITIONAL INFO ---- */
            if (data.notes || data.tx_ref !== 'N/A') {
                doc.setFontSize(isThermal ? 8 : 10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);

                if (isThermal) {
                    doc.text('Additional Info:', width / 2, finalY, { align: 'center' });
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(7);
                    if (data.tx_ref !== 'N/A') doc.text(`Tx Ref: ${data.tx_ref}`, width / 2, finalY + 4, { align: 'center' });
                    if (data.notes) doc.text(`Notes: ${data.notes}`, width / 2, finalY + 8, { align: 'center' });
                    finalY += 12;
                } else {
                    doc.text('Additional Information:', marginLeft, finalY);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(71, 85, 105);
                    if (data.tx_ref !== 'N/A') {
                        doc.text(`Transaction Ref: ${data.tx_ref}`, marginLeft, finalY + 6);
                    }
                    if (data.notes) {
                        let lines = doc.splitTextToSize(`Notes: ${data.notes}`, width - (marginLeft * 2));
                        doc.text(lines, marginLeft, finalY + 12);
                        finalY += (lines.length * 5);
                    }
                    finalY += 10;
                }
            }

            /* ---- FOOTER ---- */
            if (isThermal) {
                finalY += 5;
                doc.setDrawColor(226, 232, 240);
                doc.line(marginLeft, finalY, width - marginLeft, finalY);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text('Thank you for your business!', width / 2, finalY + 6, { align: 'center' });

                doc.setFontSize(6);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(148, 163, 184); // Slate 400
                doc.text('System generated receipt. No signature required.', width / 2, finalY + 10, { align: 'center' });
            } else {
                let yFooter = (printSize === 'A5') ? 180 : 250;
                // Avoid dropping off-page
                if (finalY > yFooter) yFooter = finalY + 20;

                doc.setDrawColor(226, 232, 240);
                doc.line(marginLeft, yFooter - 15, width - marginLeft, yFooter - 15);

                // Auth Signature
                doc.setDrawColor(148, 163, 184);
                doc.line(width - marginLeft - 40, yFooter - 5, width - marginLeft, yFooter - 5);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text('Authorized Signature', width - marginLeft - 20, yFooter, { align: 'center' });

                // Message
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(79, 70, 229); // Indigo 600
                doc.text('Thank you for your business!', marginLeft, yFooter - 5);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(148, 163, 184);
                doc.text('This is a computer generated receipt and does not require a physical signature.', marginLeft, yFooter);
            }

            // Draw a diagonal faint "PAID" Text
            doc.setFontSize(isThermal ? 40 : 100);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(230, 230, 230); // Very light gray for watermark
            doc.text('PAID', width / 2, isThermal ? 80 : 140, { angle: 45, align: 'center' });

            resolve(doc);
        } catch (error) {
            console.error("PDF generation error:", error);
            reject(error);
        }
    });
};
