const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Pool } = require('pg');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default;
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// PostgreSQL Connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// WhatsApp Client Setup
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, '.wwebjs_auth')
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
});

client.on('message_ack', async (msg, ack) => {
    /*
        0: ERROR, 1: PENDING, 2: SERVER, 3: DEVICE, 4: READ, 5: PLAYED
    */
    let status = 'Sent';
    if (ack === 3) status = 'Delivered';
    if (ack === 4) status = 'Read';

    try {
        await pool.query(
            'UPDATE order_pdfs SET whatsapp_status = $1 WHERE whatsapp_msg_id = $2',
            [status, msg.id.id]
        );
    } catch (error) {
        console.error('Error updating ack status:', error);
    }
});

client.on('authenticated', () => {
    console.log('WhatsApp Authenticated');
});

client.on('auth_failure', (msg) => {
    console.error('WhatsApp AUTH FAILURE', msg);
});

client.initialize();

// Helper to generate PDF
async function generateReceiptPDF(receiptData) {
    const doc = new jsPDF();
    const width = 210;
    const marginLeft = 15;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text('HAB CREATION', marginLeft, 20);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('123 Business Avenue, Tech District', marginLeft, 26);
    doc.text('Phone: +91 9876543210 | GST: 22AAAAA000', marginLeft, 31);

    // Receipt Meta
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('RECEIPT', width - marginLeft, 20, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Receipt No: ${receiptData.receipt_number}`, width - marginLeft, 27, { align: 'right' });
    doc.text(`Date: ${new Date(receiptData.created_at).toLocaleDateString()}`, width - marginLeft, 32, { align: 'right' });

    // Client Info
    doc.setDrawColor(226, 232, 240);
    doc.line(marginLeft, 45, width - marginLeft, 45);

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Billed To:', marginLeft, 55);
    doc.text(receiptData.client_name, marginLeft, 61);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Phone: ${receiptData.client_phone}`, marginLeft, 66);

    // Bill Table
    const tableRows = [[
        `#${receiptData.bill_number}`,
        `Rs. ${(parseFloat(receiptData.collected_amount) + parseFloat(receiptData.remaining_balance)).toLocaleString()}`,
        `Rs. ${parseFloat(receiptData.collected_amount).toLocaleString()}`,
        `Rs. ${parseFloat(receiptData.remaining_balance).toLocaleString()}`
    ]];

    autoTable(doc, {
        startY: 75,
        head: [['Bill Number', 'Original Amount', 'Paid Amount', 'Balance']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { halign: 'center' }
    });

    const finalY = doc.lastAutoTable.finalY + 15;

    // Summary
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`Total Collected: Rs. ${parseFloat(receiptData.collected_amount).toLocaleString()}`, width - marginLeft, finalY, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Remaining Balance: Rs. ${parseFloat(receiptData.remaining_balance).toLocaleString()}`, width - marginLeft, finalY + 7, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for your business! This is a system generated receipt.', marginLeft, 280);

    const fileName = `receipt_${receiptData.receipt_id}.pdf`;
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'receipts');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, fileName);

    const pdfOutput = doc.output('arraybuffer');
    fs.writeFileSync(filePath, Buffer.from(pdfOutput));

    return { fileName, filePath: `/uploads/receipts/${fileName}` };
}

// Order PDF generation helper
async function generateOrderPDF(orderData, items, clientData) {
    const doc = new jsPDF();
    const orderNumber = orderData.order_number;
    // ... (rest of generateOrderPDF same as before)

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text('STICKWELL', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text('Your Professional Solution for Stickers & Labels', 105, 26, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(20, 30, 190, 30);

    // Company & Invoice Info
    doc.setFontSize(12);
    doc.text('INVOICE', 20, 40);
    doc.setFontSize(10);
    doc.text(`Order #: ${orderNumber}`, 20, 48);
    doc.text(`Date: ${new Date(orderData.order_date).toLocaleDateString()}`, 20, 54);
    doc.text(`Status: ${orderData.status}`, 20, 60);

    // Client Info
    doc.setFontSize(12);
    doc.text('BILL TO:', 120, 40);
    doc.setFontSize(10);
    doc.text(clientData.name, 120, 48);
    doc.text(clientData.phone || 'N/A', 120, 54);
    doc.text(clientData.address || 'N/A', 120, 60, { maxWidth: 70 });
    if (clientData.gstin) {
        doc.text(`GSTIN: ${clientData.gstin}`, 120, 72);
    }

    // Items Table
    const tableRows = items.map((item, index) => [
        index + 1,
        item.product_name,
        item.quantity,
        `₹${parseFloat(item.unit_price).toFixed(2)}`,
        `${item.gst_percent}%`,
        `₹${parseFloat(item.tax_amount).toFixed(2)}`,
        `₹${parseFloat(item.total_amount).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 80,
        head: [['#', 'Description', 'Qty', 'Price', 'GST%', 'Tax', 'Total']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [40, 44, 52] },
        styles: { fontSize: 9 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Totals
    doc.setFontSize(10);
    doc.text(`Sub Total: ₹${parseFloat(orderData.sub_total).toFixed(2)}`, 140, finalY);
    doc.text(`Discount: ₹${parseFloat(orderData.discount_amount).toFixed(2)}`, 140, finalY + 6);
    doc.text(`Tax Total: ₹${parseFloat(orderData.tax_amount).toFixed(2)}`, 140, finalY + 12);

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: ₹${parseFloat(orderData.total_amount).toFixed(2)}`, 140, finalY + 20);

    // Footer / Signature
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Notes:', 20, finalY);
    doc.text(orderData.notes || 'None', 20, finalY + 6, { maxWidth: 100 });

    doc.text('____________________', 150, finalY + 50);
    doc.text('Authorized Signature', 150, finalY + 56);

    const fileName = `${orderNumber}.pdf`;
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'invoices');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, fileName);

    const pdfOutput = doc.output('arraybuffer');
    fs.writeFileSync(filePath, Buffer.from(pdfOutput));

    return { fileName, filePath: `/uploads/invoices/${fileName}` };
}

// Endpoint to generate PDF
app.post('/generate-pdf', async (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    try {
        // Fetch order details
        const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const orderData = orderRes.rows[0];

        // Fetch client details
        const clientRes = await pool.query('SELECT * FROM clients WHERE id = $1', [orderData.client_id]);
        const clientData = clientRes.rows[0];

        // Fetch order items
        const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order_id]);
        const items = itemsRes.rows;

        // Generate PDF
        const { fileName, filePath } = await generateOrderPDF(orderData, items, clientData);

        // Save to order_pdfs table
        await pool.query(
            'INSERT INTO order_pdfs (order_id, pdf_filename, pdf_path) VALUES ($1, $2, $3) ON CONFLICT (order_id) DO UPDATE SET pdf_filename = EXCLUDED.pdf_filename, pdf_path = EXCLUDED.pdf_path, generated_at = CURRENT_TIMESTAMP',
            [order_id, fileName, filePath]
        );

        res.json({ success: true, message: 'PDF generated successfully', pdf_url: filePath });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Endpoint to send WhatsApp Receipt
app.post('/send-receipt-whatsapp', async (req, res) => {
    const { receipt_id } = req.body;

    if (!receipt_id) {
        return res.status(400).json({ success: false, message: 'Receipt ID is required' });
    }

    try {
        // Fetch receipt & client info
        const query = `
            SELECT r.*, c.name as client_name, c.phone as client_phone, b.bill_number 
            FROM collection_receipts r
            JOIN clients c ON r.client_id = c.id
            JOIN bills b ON r.bill_id = b.id
            WHERE r.receipt_id = $1
        `;
        const receiptRes = await pool.query(query, [receipt_id]);
        if (receiptRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Receipt record not found' });
        }
        const receiptData = receiptRes.rows[0];

        if (!receiptData.client_phone) {
            return res.status(400).json({ success: false, message: 'Client phone number not found' });
        }

        // Generate PDF
        const { fileName, filePath } = await generateReceiptPDF(receiptData);

        // Update DB with path if needed
        await pool.query('UPDATE collection_receipts SET receipt_pdf_path = $1 WHERE receipt_id = $2', [filePath, receipt_id]);

        // WhatsApp Setup
        let mobile = receiptData.client_phone.replace(/\D/g, '');
        if (mobile.length === 10) mobile = '91' + mobile;
        const chatId = `${mobile}@c.us`;

        const fullPdfPath = path.join(__dirname, '..', filePath);
        const media = MessageMedia.fromFilePath(fullPdfPath);

        const message = `Dear *${receiptData.client_name}*,\n\nThank you for your payment. Please find attached your Receipt *#${receiptData.receipt_number || receipt_id}* for Bill *#${receiptData.bill_number}*.\n\nValidated Amount: *Rs. ${parseFloat(receiptData.collected_amount).toLocaleString()}*.\nCaptured Balance: *Rs. ${parseFloat(receiptData.remaining_balance).toLocaleString()}*.`;

        await client.sendMessage(chatId, message);
        await client.sendMessage(chatId, media, { caption: `Receipt ${receiptData.receipt_number || receipt_id}` });

        // Update WhatsApp Status
        await pool.query('UPDATE collection_receipts SET whatsapp_status = $1 WHERE receipt_id = $2', ['Sent', receipt_id]);

        res.json({ success: true, message: 'Receipt sent via WhatsApp successfully' });
    } catch (error) {
        console.error('Error sending receipt WhatsApp:', error);
        res.status(500).json({ success: false, message: 'Failed to send WhatsApp message', error: error.message });
    }
});

// Endpoint to send WhatsApp
app.post('/send-whatsapp', async (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    try {
        // Fetch order & client info FIRST, because we might need them to generate PDF
        const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order record not found' });
        }
        const orderData = orderRes.rows[0];

        const clientRes = await pool.query('SELECT name, phone, address, gstin FROM clients WHERE id = $1', [orderData.client_id]);
        const clientData = clientRes.rows[0];

        // Fetch PDF info
        const pdfRes = await pool.query('SELECT * FROM order_pdfs WHERE order_id = $1', [order_id]);
        let pdfInfo = pdfRes.rows[0];

        // Auto-generate if not in DB at all (legacy order or failure during creation)
        if (!pdfInfo) {
            console.log(`PDF record missing for order ${order_id}, auto-generating...`);
            const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order_id]);
            const { fileName, filePath } = await generateOrderPDF(orderData, itemsRes.rows, clientData);
            await pool.query(
                'INSERT INTO order_pdfs (order_id, pdf_filename, pdf_path) VALUES ($1, $2, $3) ON CONFLICT (order_id) DO UPDATE SET pdf_filename = EXCLUDED.pdf_filename, pdf_path = EXCLUDED.pdf_path, generated_at = CURRENT_TIMESTAMP',
                [order_id, fileName, filePath]
            );
            pdfInfo = { pdf_path: filePath };
        }

        if (!clientData.phone) {
            return res.status(400).json({ success: false, message: 'Client phone number not found in database' });
        }

        // Format and validate mobile number (India focused)
        let mobile = clientData.phone.replace(/\D/g, '');
        if (mobile.length === 10) {
            mobile = '91' + mobile;
        } else if (mobile.length === 12 && mobile.startsWith('91')) {
            // OK
        } else if (mobile.length < 10) {
            return res.status(400).json({ success: false, message: 'Invalid mobile number format. Must be at least 10 digits.' });
        }

        const chatId = `${mobile}@c.us`;

        // Load PDF
        let fullPdfPath = path.join(__dirname, '..', pdfInfo.pdf_path);

        // Auto-regenerate if missing on disk
        if (!fs.existsSync(fullPdfPath)) {
            console.log(`PDF missing for order ${order_id}, regenerating...`);
            const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order_id]);
            await generateOrderPDF(orderData, itemsRes.rows, clientData);
        }

        if (!fs.existsSync(fullPdfPath)) {
            return res.status(404).json({ success: false, message: 'PDF file not found and could not be regenerated' });
        }

        const media = MessageMedia.fromFilePath(fullPdfPath);

        // Send Message
        const message = `Dear *${clientData.name}*,\n\nPlease find attached your Order Invoice *#${orderData.order_number}*.\n\nThank you for your business with *STICKWELL*!`;

        await client.sendMessage(chatId, message);
        const sentMsg = await client.sendMessage(chatId, media, { caption: `Invoice ${orderData.order_number}` });

        // Update DB
        await pool.query(
            'UPDATE order_pdfs SET whatsapp_sent_at = CURRENT_TIMESTAMP, whatsapp_status = $1, whatsapp_msg_id = $2 WHERE order_id = $3',
            ['Sent', sentMsg.id.id, order_id]
        );

        res.json({ success: true, message: 'WhatsApp message sent successfully' });
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        res.status(500).json({ success: false, message: 'Failed to send WhatsApp message', error: error.message });
    }
});

// Status tracking (webhook equivalent or just simple GET)
app.get('/whatsapp-status/:order_id', async (req, res) => {
    const { order_id } = req.params;
    try {
        const result = await pool.query('SELECT whatsapp_status, whatsapp_sent_at, whatsapp_msg_id FROM order_pdfs WHERE order_id = $1', [order_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order PDF record not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Endpoint to send Route Plan WhatsApp
app.post('/send-route-whatsapp', async (req, res) => {
    const { route_id } = req.body;

    if (!route_id) {
        return res.status(400).json({ success: false, message: 'Route ID is required' });
    }

    try {
        // Fetch route details
        const routeRes = await pool.query('SELECT * FROM route_plans WHERE route_id = $1', [route_id]);
        if (routeRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Route plan not found' });
        }
        const routeData = routeRes.rows[0];

        if (!routeData.pdf_path) {
            return res.status(400).json({ success: false, message: 'Route PDF not generated yet' });
        }

        // Fetch salesman details
        const salesmanRes = await pool.query('SELECT name, mobile_number FROM users WHERE id = $1', [routeData.salesman_id]);
        if (salesmanRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Salesman not found' });
        }
        const salesmanData = salesmanRes.rows[0];

        if (!salesmanData.mobile_number) {
            return res.status(400).json({ success: false, message: 'Salesman mobile number not found' });
        }

        // Format mobile
        let mobile = salesmanData.mobile_number.replace(/\D/g, '');
        if (mobile.length === 10) mobile = '91' + mobile;
        const chatId = `${mobile}@c.us`;

        const fullPdfPath = path.join(__dirname, '..', routeData.pdf_path);
        if (!fs.existsSync(fullPdfPath)) {
            return res.status(404).json({ success: false, message: 'PDF file not found on server disk' });
        }

        const media = MessageMedia.fromFilePath(fullPdfPath);

        const routeDateStr = new Date(routeData.route_date).toLocaleDateString();
        const message = `Hello *${salesmanData.name}*,\n\nYour route plan for *${routeDateStr}* is ready.\n\nPlease find attached the client visit list including outstanding bill details.\n\nThank you.`;

        await client.sendMessage(chatId, message);
        await client.sendMessage(chatId, media, { caption: `Route Plan ${routeDateStr}` });

        // Update DB
        await pool.query('UPDATE route_plans SET whatsapp_status = $1 WHERE route_id = $2', ['Sent', route_id]);

        res.json({ success: true, message: 'Route plan sent via WhatsApp successfully' });
    } catch (error) {
        console.error('Error sending Route WhatsApp:', error);
        res.status(500).json({ success: false, message: 'Failed to send WhatsApp message', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Automation service running on port ${port}`);
});
