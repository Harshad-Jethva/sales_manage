import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Plus,
    Trash2,
    Save,
    X,
    Building2,
    Box,
    History,
    ArrowDownLeft,
    Search,
    Eye,
    Camera,
    AlertCircle,
    Calculator,
    Package,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import SEO from '../../components/common/SEO';
import ImageEditorModal from '../../components/common/ImageEditorModal';

// Error Boundary Fallback for UI
const ErrorFallback = ({ error }) => (
    <div style={{ padding: '2rem', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '12px', color: '#fca5a5', margin: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><AlertCircle /> Render Error Detected</h2>
        <p style={{ marginTop: '1rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '1rem' }}>{error.message}</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>Reload Terminal</button>
    </div>
);

const Bills = () => {
    const [activeTab, setActiveTab] = useState('invoices');
    const [billList, setBillList] = useState([]);
    const [supplierList, setSupplierList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [renderError, setRenderError] = useState(null);

    const [showBillModal, setShowBillModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [viewBill, setViewBill] = useState(null); // Selected bill for viewing

    // Image Editor State
    const [editorImage, setEditorImage] = useState(null);
    const [editingRowId, setEditingRowId] = useState(null);
    const [imageActionPrompt, setImageActionPrompt] = useState(null);

    const fetchBillDetails = async (id) => {
        try {
            const res = await axios.get(`http://localhost/sales_manage/backend/api/bills.php?id=${id}`);
            if (res.data) {
                setViewBill(res.data);
            }
        } catch (err) {
            console.error("Fetch Bill Details Error:", err);
            alert("Could not load bill details.");
        }
    };

    const [billData, setBillData] = useState({
        bill_type: 'purchase', // Defaulting to Purchase only
        customer_id: '',
        supplier_id: '',
        bill_number: '',
        bill_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
        notes: '',
        bill_image: null
    });

    const [billItems, setBillItems] = useState([
        { id: Math.random(), product_id: '', name: '', item_code: '', barcode: '', mrp: 0, regular_discount: 0, gst: 0, price: 0, selling_price: 0, quantity: 1, total: 0, total_selling_price: 0, product_image: null }
    ]);

    const [prodData, setProdData] = useState({
        name: '', sku: '', mrp: '', sale_price: '', purchase_price: '', stock_quantity: '0', unit: 'pcs'
    });
    const containerRef = useRef(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                gsap.utils.toArray('.bill-anim-el', containerRef.current),
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }
            );
        }
    }, [activeTab]);

    const fetchAllData = async () => {
        try {
            const [billsRes, suppsRes, prodsRes] = await Promise.all([
                axios.get('http://localhost/sales_manage/backend/api/bills.php'),
                axios.get('http://localhost/sales_manage/backend/api/stores.php'),
                axios.get('http://localhost/sales_manage/backend/api/products.php')
            ]);

            setBillList(Array.isArray(billsRes.data) ? billsRes.data : []);
            setSupplierList(Array.isArray(suppsRes.data) ? suppsRes.data : []);
            setProductList(Array.isArray(prodsRes.data) ? prodsRes.data : []);
        } catch (err) {
            console.error("API Fetch Error:", err);
        }
    };

    const generateBillNo = () => {
        return `PUR-${Math.floor(100000 + Math.random() * 900000)}`;
    };

    const addBillRow = () => {
        setBillItems([...billItems, { id: Math.random(), product_id: '', name: '', item_code: '', barcode: '', mrp: 0, regular_discount: 0, gst: 0, price: 0, selling_price: 0, quantity: 1, total: 0, total_selling_price: 0, product_image: null }]);
    };

    const removeBillRow = (id) => {
        if (billItems.length > 1) {
            setBillItems(billItems.filter(item => item.id !== id));
        }
    };

    const updateBillRow = (id, field, value) => {
        const newItems = billItems.map(item => {
            if (item.id === id) {
                let updated = { ...item, [field]: value };

                if (field === 'product_id' && value) {
                    const prod = productList.find(p => p.id == value);
                    if (prod) {
                        updated.name = prod.name;
                        updated.item_code = prod.sku;
                        updated.barcode = prod.barcode || '';
                        updated.mrp = prod.mrp;
                        updated.price = prod.purchase_price;
                        updated.selling_price = prod.sale_price;
                        updated.gst = prod.gst_percent || 0;
                        if (prod.mrp > 0) {
                            updated.regular_discount = (((prod.mrp - prod.purchase_price) / prod.mrp) * 100).toFixed(2);
                        }
                    }
                }

                const mrpVal = parseFloat(updated.mrp) || 0;
                const discVal = parseFloat(updated.regular_discount) || 0;
                const priceVal = parseFloat(updated.price) || 0;
                const salesVal = parseFloat(updated.selling_price) || 0;
                const qtyVal = parseFloat(updated.quantity) || 0;

                // Sync Price and Discount
                if (field === 'mrp' || field === 'regular_discount') {
                    // Calculate Price (Cost) based on MRP and Discount
                    updated.price = (mrpVal - (mrpVal * (discVal / 100))).toFixed(2);
                }

                if (field === 'price' && mrpVal > 0) {
                    // Update Discount based on manually entered Price (Cost)
                    // If Cost changes, Discount % Recalculates
                    updated.regular_discount = (((mrpVal - value) / mrpVal) * 100).toFixed(2);
                }

                // Recalc totals
                // Note: We use the *updated* values, so we must re-parse them just to be safe or use variable if logic flows
                // Usually easier to re-read from updated obj

                const fPrice = parseFloat(updated.price) || 0;
                const fSell = parseFloat(updated.selling_price) || 0;
                const fQty = parseFloat(updated.quantity) || 0;

                updated.total = (fPrice * fQty).toFixed(2);
                updated.total_selling_price = (fSell * fQty).toFixed(2);

                return updated;
            }
            return item;
        });
        setBillItems(newItems);
    };

    const calcSubTotal = billItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const calcTax = calcSubTotal * 0.18;
    const calcGrandTotal = calcSubTotal + calcTax;

    const onBillSubmit = async (e) => {
        e.preventDefault();
        if (!billData.supplier_id) return alert("Please select a Supplier/Vendor");

        const validItems = billItems.filter(item => item.name && item.quantity > 0);
        if (validItems.length === 0) return alert("Add at least one item");

        const formData = new FormData();
        Object.keys(billData).forEach(key => formData.append(key, billData[key]));
        formData.append('items', JSON.stringify(validItems));

        validItems.forEach((item, index) => {
            if (item.product_image instanceof File) {
                formData.append(`product_image_${index}`, item.product_image);
                if (item.product_image.isEdited) {
                    formData.append(`is_edited_${index}`, '1');
                }
            }
        });

        formData.append('sub_total', calcSubTotal);
        formData.append('total_amount', calcGrandTotal);
        formData.append('paid_amount', calcGrandTotal);

        try {
            const res = await axios.post('http://localhost/sales_manage/backend/api/bills.php', formData);
            if (res.data.success) {
                setShowBillModal(false);
                fetchAllData();
                alert(`Vendor Bill Recorded: ${billData.bill_number}`);
            } else {
                alert("Error: " + res.data.error);
            }
        } catch (err) { alert("Submission failed."); }
    };

    const onProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost/sales_manage/backend/api/products.php', prodData);
            if (res.data.success) {
                setShowProductModal(false);
                setProdData({ name: '', sku: '', mrp: '', sale_price: '', purchase_price: '', stock_quantity: '0', unit: 'pcs' });
                fetchAllData();
                alert("New product added to catalog.");
            }
        } catch (err) { console.error(err); }
    };

    if (renderError) return <ErrorFallback error={renderError} />;

    try {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pos-hub" ref={containerRef}>
                <SEO title="Vendor Billing" description="Record stock inward and manage supplier invoices." />
                <header className="page-header bill-anim-el">
                    <div>
                        <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>Vendor Billing & Inventory</motion.h1>
                        <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-muted">
                            Record stock inward and manage supplier invoices.
                        </motion.p>
                    </div>
                    <div className="header-actions">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-secondary-glass"
                            onClick={() => setShowProductModal(true)}
                        >
                            <Package size={18} /> Catalog Matrix
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary-gradient"
                            onClick={() => {
                                setBillData({
                                    ...billData,
                                    bill_number: generateBillNo(),
                                    supplier_id: '',
                                    bill_type: 'purchase'
                                });
                                setBillItems([{ id: Math.random(), product_id: '', name: '', item_code: '', barcode: '', mrp: 0, regular_discount: 0, gst: 0, price: 0, selling_price: 0, quantity: 1, total: 0, total_selling_price: 0, product_image: null }]);
                                setShowBillModal(true);
                            }}
                        >
                            <Plus size={18} /> New Vendor Bill
                        </motion.button>
                    </div>
                </header>

                <div className="stats-header-grid bill-anim-el">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card stat-wide">
                        <div className="stat-content">
                            <p>Total Stock Inward</p>
                            <h3>₹{billList.filter(b => b.bill_type === 'purchase').reduce((s, b) => s + parseFloat(b.total_amount || 0), 0).toLocaleString()}</h3>
                        </div>
                        <div className="stat-icon-circle bg-indigo"><ArrowDownLeft size={24} /></div>
                    </motion.div>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card stat-wide">
                        <div className="stat-content">
                            <p>Active Vendors</p>
                            <h3>{supplierList.length}</h3>
                        </div>
                        <div className="stat-icon-circle bg-emerald"><Building2 size={24} /></div>
                    </motion.div>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card stat-wide">
                        <div className="stat-content">
                            <p>Inventory Valuation</p>
                            <h3>₹{productList.reduce((s, p) => s + ((parseFloat(p.stock_quantity) || 0) * (parseFloat(p.purchase_price) || 0)), 0).toLocaleString()}</h3>
                        </div>
                        <div className="stat-icon-circle bg-amber"><Box size={24} /></div>
                    </motion.div>
                </div>

                <div className="main-tabs bill-anim-el">
                    <button className={`tab-link ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>
                        <History size={18} /> Purchase Register
                    </button>
                    <button className={`tab-link ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
                        <Package size={18} /> Current Stock
                    </button>
                </div>

                <div className="tab-body bill-anim-el">
                    <AnimatePresence mode="wait">
                        {activeTab === 'invoices' ? (
                            <motion.div key="invoices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card full-table">
                                <div className="table-header-row">
                                    <h3>Inward Logs</h3>
                                    <div className="search-mini"><Search size={16} /><input type="text" placeholder="Filter bills..." /></div>
                                </div>
                                <div className="table-scroll" style={{ overflowX: 'auto' }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Bill #</th><th>Date</th><th>Vendor</th><th>Grand Total</th><th>Method</th><th>Status</th><th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {billList.filter(b => b.bill_type === 'purchase').map(bill => (
                                                <motion.tr whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }} key={bill.id} onClick={() => fetchBillDetails(bill.id)} style={{ cursor: 'pointer' }}>
                                                    <td className="font-bold text-primary">{bill.bill_number}</td>
                                                    <td>{bill.bill_date}</td>
                                                    <td>
                                                        <div className="party-cell">
                                                            <Building2 size={14} />
                                                            {bill.supplier_name || 'Generic Vendor'}
                                                        </div>
                                                    </td>
                                                    <td className="font-bold">₹{parseFloat(bill.total_amount || 0).toLocaleString()}</td>
                                                    <td>{bill.payment_method}</td>
                                                    <td><span className={`badge badge-${bill.status || 'pending'}`}>{String(bill.status || 'PENDING').toUpperCase()}</span></td>
                                                    <td><button className="btn-icon" onClick={(e) => { e.stopPropagation(); fetchBillDetails(bill.id); }}><Eye size={16} /></button></td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card full-table">
                                <div className="table-header-row"><h3>Catalog Status</h3></div>
                                <div className="table-scroll" style={{ overflowX: 'auto' }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }}>Pic</th><th>Item Name</th><th>Cost Price</th><th>Selling Rate</th><th>MRP</th><th>Available Stock</th><th>Health</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productList.map(p => (
                                                <motion.tr whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }} key={p.id}>
                                                    <td className="p-2">
                                                        {p.image_path ? (
                                                            <a href={`http://localhost/sales_manage/backend/${p.image_path}`} target="_blank" rel="noreferrer">
                                                                <img src={`http://localhost/sales_manage/backend/${p.image_path}`} alt="Product" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '4px' }} />
                                                            </a>
                                                        ) : (
                                                            <div className="row-img-placeholder" style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}><Box size={16} /></div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="prod-col"><span className="font-bold">{p.name}</span><span className="sku-tag">{p.sku || 'N/A'}</span></div>
                                                    </td>
                                                    <td>₹{p.purchase_price}</td>
                                                    <td className="font-bold text-success">₹{p.sale_price}</td>
                                                    <td>₹{p.mrp}</td>
                                                    <td className="font-bold">{p.stock_quantity} {p.unit}</td>
                                                    <td>
                                                        {p.stock_quantity < 5 ? (
                                                            <span className="health-badge low">REFILL</span>
                                                        ) : (
                                                            <span className="health-badge good">OPTIMAL</span>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {viewBill && (
                        <div className="modal-root">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setViewBill(null)} />
                            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="modal-content-glass medium">
                                <div className="pos-header">
                                    <div className="pos-title">
                                        <div className="pos-icon-box inward"><Eye size={24} /></div>
                                        <div><h2>Bill Details</h2><p className="text-muted">{viewBill.bill_number}</p></div>
                                    </div>
                                    <button className="close-btn" onClick={() => setViewBill(null)}><X size={20} /></button>
                                </div>
                                <div className="p-4">
                                    <div className="grid-2-bw mb-6">
                                        <div>
                                            <p className="text-muted text-sm">Vendor / Supplier</p>
                                            <h3 className="text-lg font-bold">{viewBill.supplier_name || 'Generic Vendor'}</h3>
                                            <p className="text-muted text-sm mt-2">Date: {viewBill.bill_date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-muted text-sm">Status</p>
                                            <span className={`badge badge-${viewBill.status}`}>{viewBill.status ? viewBill.status.toUpperCase() : 'PENDING'}</span>
                                            <p className="text-muted text-sm mt-2">Payment: {viewBill.payment_method}</p>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <table style={{ width: '100%' }}>
                                            <thead>
                                                <tr><th className="text-left">Image</th><th className="text-left">Item</th><th className="text-left">Code</th><th className="text-right">Cost</th><th className="text-right">Qty</th><th className="text-right">Total</th></tr>
                                            </thead>
                                            <tbody>
                                                {viewBill.items && viewBill.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="p-2">
                                                            {item.image_path ? (
                                                                <a href={`http://localhost/sales_manage/backend/${item.image_path}`} target="_blank" rel="noreferrer">
                                                                    <img src={`http://localhost/sales_manage/backend/${item.image_path}`} alt="Product" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '4px' }} />
                                                                </a>
                                                            ) : (
                                                                <div className="row-img-placeholder" style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}><Package size={16} /></div>
                                                            )}
                                                        </td>
                                                        <td className="p-2">{item.item_name}</td>
                                                        <td className="p-2 text-muted">{item.item_code || '-'}</td>
                                                        <td className="p-2 text-right">₹{parseFloat(item.price_after_discount).toLocaleString()}</td>
                                                        <td className="p-2 text-right">{item.quantity}</td>
                                                        <td className="p-2 text-right font-bold">₹{parseFloat(item.total).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bill-footer-summary">
                                        <div className="text-right">
                                            <div className="flex-between"><span className="text-muted">Subtotal</span><span>₹{parseFloat(viewBill.sub_total).toLocaleString()}</span></div>
                                            <div className="flex-between"><span className="text-muted">Tax</span><span>₹{parseFloat(viewBill.tax_amount).toLocaleString()}</span></div>
                                            <div className="flex-between grand-total"><span>Grand Total</span><span>₹{parseFloat(viewBill.total_amount).toLocaleString()}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {showBillModal && (
                        <div className="modal-root">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowBillModal(false)} />
                            <motion.div initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 30, opacity: 0 }} className="modal-content-glass large">
                                <div className="pos-header">
                                    <div className="pos-title">
                                        <div className="pos-icon-box inward"><Calculator size={24} /></div>
                                        <div><h2>Vendor Billing Counter</h2><p className="text-muted">Recording Stock Inward (Purchase)</p></div>
                                    </div>
                                    <button className="close-btn" onClick={() => setShowBillModal(false)}><X size={20} /></button>
                                </div>

                                <form onSubmit={onBillSubmit} className="pos-form">
                                    <div className="pos-meta-grid">
                                        <div className="input-box">
                                            <label>Select Vendor</label>
                                            <select required className="input-control" value={billData.supplier_id} onChange={(e) => setBillData({ ...billData, supplier_id: e.target.value })}>
                                                <option value="">-- Choose Vendor --</option>
                                                {supplierList.map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
                                            </select>
                                        </div>
                                        <div className="input-box"><label>Bill Number</label><input className="input-control" type="text" value={billData.bill_number} readOnly /></div>
                                        <div className="input-box"><label>Payment Mode</label><select className="input-control" value={billData.payment_method} onChange={(e) => setBillData({ ...billData, payment_method: e.target.value })}><option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Bank">Bank Trans.</option></select></div>
                                        <div className="input-box"><label>Invoice Date</label><input className="input-control" type="date" value={billData.bill_date} onChange={(e) => setBillData({ ...billData, bill_date: e.target.value })} /></div>
                                    </div>

                                    <div className="pos-items-area">
                                        <div className="area-header">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <h3>Billing Items</h3>
                                                <span className="text-muted text-sm" style={{ fontStyle: 'italic' }}>* Image upload is optional</span>
                                            </div>
                                            <button type="button" className="btn-secondary-small" onClick={addBillRow}>+ Add Row</button>
                                        </div>
                                        <div className="table-responsive-scroll">
                                            <table className="pos-items-table">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '40px' }}>Sr</th><th style={{ width: '60px' }}>Image</th><th style={{ width: '250px' }}>Item Name</th><th style={{ width: '100px' }}>Code</th><th style={{ width: '120px' }}>Barcode</th><th style={{ width: '100px' }}>MRP</th><th style={{ width: '80px' }}>Disc %</th><th style={{ width: '100px' }}>Cost</th><th style={{ width: '100px' }}>Sell Price</th><th style={{ width: '70px' }}>GST %</th><th style={{ width: '80px' }}>Qty</th><th style={{ width: '120px' }}>Total Cost</th><th style={{ width: '120px' }}>Total Sell</th><th style={{ width: '40px' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {billItems.map((item, index) => (
                                                        <tr key={item.id}>
                                                            <td className="text-center">{index + 1}</td>
                                                            <td className="text-center">
                                                                <label
                                                                    className="row-img-upload"
                                                                    onDragOver={(e) => e.preventDefault()}
                                                                    onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) { setImageActionPrompt({ file: e.dataTransfer.files[0], rowId: item.id }); } }}
                                                                >
                                                                    <input
                                                                        type="file"
                                                                        accept="image/jpeg, image/png, image/webp"
                                                                        style={{ display: 'none' }}
                                                                        onClick={(e) => { e.target.value = null; }}
                                                                        onChange={(e) => { if (e.target.files[0]) { setImageActionPrompt({ file: e.target.files[0], rowId: item.id }); } }}
                                                                    />
                                                                    {item.product_image && item.product_image instanceof File ? (
                                                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                                            <img src={URL.createObjectURL(item.product_image)} alt="Preview" className="row-img-preview" />
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateBillRow(item.id, 'product_image', null); }}
                                                                                style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, zIndex: 10 }}
                                                                            >✕</button>
                                                                            <div
                                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditorImage(item.product_image); setEditingRowId(item.id); }}
                                                                                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', opacity: 0, cursor: 'pointer', transition: 'opacity 0.2s' }}
                                                                                className="img-edit-overlay"
                                                                            ><span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>Edit</span></div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="row-img-placeholder" title="Drag & Drop or Click to upload"><Camera size={14} /></div>
                                                                    )}
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <div className="row-flex">
                                                                    <select className="row-select" value={item.product_id} onChange={(e) => updateBillRow(item.id, 'product_id', e.target.value)}>
                                                                        <option value="">-- Catalog --</option>
                                                                        {productList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                                    </select>
                                                                    <input className="row-input" type="text" placeholder="Item Name" value={item.name} onChange={(e) => updateBillRow(item.id, 'name', e.target.value)} />
                                                                </div>
                                                            </td>
                                                            <td><input className="row-input" value={item.item_code || ''} onChange={(e) => updateBillRow(item.id, 'item_code', e.target.value)} /></td>
                                                            <td><input className="row-input" value={item.barcode || ''} onChange={(e) => updateBillRow(item.id, 'barcode', e.target.value)} /></td>
                                                            <td><input className="row-input" type="number" step="0.01" value={item.mrp} onChange={(e) => updateBillRow(item.id, 'mrp', e.target.value)} /></td>
                                                            <td><input className="row-input" type="number" step="0.01" value={item.regular_discount} onChange={(e) => updateBillRow(item.id, 'regular_discount', e.target.value)} /></td>
                                                            <td><input className="row-input" type="number" step="0.01" value={item.price} onChange={(e) => updateBillRow(item.id, 'price', e.target.value)} /></td>
                                                            <td><input className="row-input" type="number" step="0.01" value={item.selling_price} onChange={(e) => updateBillRow(item.id, 'selling_price', e.target.value)} /></td>
                                                            <td><input className="row-input" type="number" step="0.01" value={item.gst} onChange={(e) => updateBillRow(item.id, 'gst', e.target.value)} /></td>
                                                            <td><input className="row-input" type="number" step="0.01" value={item.quantity} onChange={(e) => updateBillRow(item.id, 'quantity', e.target.value)} /></td>
                                                            <td className="font-bold text-primary">₹{parseFloat(item.total || 0).toLocaleString()}</td>
                                                            <td className="font-bold text-muted">₹{parseFloat(item.total_selling_price || 0).toLocaleString()}</td>
                                                            <td><button type="button" className="btn-del" onClick={() => removeBillRow(item.id)}><Trash2 size={16} /></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="pos-bottom-section">
                                        <div className="left-side">
                                            <div className="file-upload-box"><label><Camera size={14} /> Upload Invoice</label><input type="file" onChange={(e) => setBillData({ ...billData, bill_image: e.target.files[0] })} /></div>
                                            <textarea className="input-control" rows="3" value={billData.notes} onChange={(e) => setBillData({ ...billData, notes: e.target.value })} placeholder="Internal notes..."></textarea>
                                        </div>
                                        <div className="pos-summary-box">
                                            <div className="sum-line"><span>Taxable Value</span><span>₹{calcSubTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                            <div className="sum-line"><span>Estimated GST (18%)</span><span>₹{calcTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                            <div className="sum-line-total"><span>Grand Amount</span><span>₹{calcGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                            <button type="submit" className="btn-save-bill"><Save size={20} /> Process Vendor Bill</button>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {showProductModal && (
                        <div className="modal-root">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowProductModal(false)} />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-content-glass medium">
                                <h2>Direct Catalog Entry</h2>
                                <form onSubmit={onProductSubmit} className="v-form">
                                    <div className="f-group"><label>Product Title</label><input className="input-control" required value={prodData.name} onChange={(e) => setProdData({ ...prodData, name: e.target.value })} /></div>
                                    <div className="grid-2">
                                        <div className="f-group"><label>MRP</label><input className="input-control" type="number" step="0.01" value={prodData.mrp} onChange={(e) => setProdData({ ...prodData, mrp: e.target.value })} /></div>
                                        <div className="f-group"><label>Stock</label><input className="input-control" type="number" value={prodData.stock_quantity} onChange={(e) => setProdData({ ...prodData, stock_quantity: e.target.value })} /></div>
                                    </div>
                                    <div className="grid-2">
                                        <div className="f-group"><label>Cost</label><input className="input-control" type="number" step="0.01" value={prodData.purchase_price} onChange={(e) => setProdData({ ...prodData, purchase_price: e.target.value })} /></div>
                                        <div className="f-group"><label>Sell Rate</label><input className="input-control" type="number" step="0.01" value={prodData.sale_price} onChange={(e) => setProdData({ ...prodData, sale_price: e.target.value })} /></div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn-secondary-glass" onClick={() => setShowProductModal(false)}>Discard</button>
                                        <button type="submit" className="btn-primary-gradient">Add Item</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {imageActionPrompt && (
                        <div className="modal-root">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setImageActionPrompt(null)} />
                            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="modal-content-glass" style={{ padding: '2.5rem 2rem', maxWidth: '450px', width: '90%', textAlign: 'center', margin: 'auto' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.15)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <Sparkles size={40} className="text-primary" />
                                </div>
                                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: '800' }}>Image Added!</h2>
                                <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5' }}>
                                    Would you like to open the Studio Editor to crop, adjust, or remove background?
                                </p>
                                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr' }}>
                                    <button
                                        type="button"
                                        className="btn-primary-gradient"
                                        style={{ justifyContent: 'center', padding: '1rem' }}
                                        onClick={() => {
                                            setEditorImage(imageActionPrompt.file);
                                            setEditingRowId(imageActionPrompt.rowId);
                                            setImageActionPrompt(null);
                                        }}
                                    >
                                        <Sparkles size={20} /> Open Studio Editor
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-secondary-glass"
                                        style={{ justifyContent: 'center', padding: '1rem' }}
                                        onClick={() => {
                                            updateBillRow(imageActionPrompt.rowId, 'product_image', imageActionPrompt.file);
                                            setImageActionPrompt(null);
                                        }}
                                    >
                                        <Save size={20} /> Use Original Image
                                    </button>
                                </div>
                                <button type="button" className="close-btn" style={{ position: 'absolute', top: '15px', right: '15px' }} onClick={() => setImageActionPrompt(null)}><X size={24} /></button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <ImageEditorModal
                    isOpen={!!editorImage}
                    initialImage={editorImage}
                    onCancel={() => { setEditorImage(null); setEditingRowId(null); }}
                    onSave={(processedFile) => {
                        updateBillRow(editingRowId, 'product_image', processedFile);
                        setEditorImage(null);
                        setEditingRowId(null);
                    }}
                />

                <style jsx>{`
                    .pos-hub {
                        max-width: 1400px;
                        margin: 0 auto;
                        padding-bottom: 5rem;
                        color: #fff;
                    }
                    .page-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 2rem;
                    }
                    .page-header h1 {
                        font-size: 2.2rem;
                        font-weight: 800;
                        margin: 0;
                        background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .text-muted { color: #94a3b8; }
                    
                    .header-actions {
                        display: flex;
                        gap: 1rem;
                    }
                    
                    /* Buttons with gradients and glass effects */
                    .btn-secondary-glass {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.8rem 1.2rem;
                        background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 10px;
                        color: #fff;
                        cursor: pointer;
                        backdrop-filter: blur(10px);
                        transition: all 0.3s ease;
                        font-weight: 600;
                    }
                    .btn-secondary-glass:hover {
                        background: rgba(255,255,255,0.1);
                        border-color: rgba(255,255,255,0.2);
                        transform: translateY(-2px);
                    }
                    
                    .btn-primary-gradient {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.8rem 1.5rem;
                        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                        border: none;
                        border-radius: 10px;
                        color: #fff;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                        font-weight: 600;
                        transition: all 0.3s ease;
                    }
                    .btn-primary-gradient:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
                    }

                    .stats-header-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1.5rem;
                        margin-bottom: 3rem;
                    }
                    .glass-card {
                        background: rgba(30, 41, 59, 0.7);
                        backdrop-filter: blur(16px);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 20px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    }
                    .stat-wide {
                        padding: 1.5rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .stat-content p {
                        font-size: 0.9rem;
                        color: #94a3b8;
                        margin: 0 0 0.5rem 0;
                        font-weight: 500;
                    }
                    .stat-content h3 {
                        font-size: 1.8rem;
                        font-weight: 700;
                        color: #fff;
                        margin: 0;
                    }
                    .stat-icon-circle {
                        width: 48px;
                        height: 48px;
                        border-radius: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(255,255,255,0.05);
                    }
                    .bg-indigo { color: #818cf8; background: rgba(99, 102, 241, 0.15); }
                    .bg-emerald { color: #34d399; background: rgba(16, 185, 129, 0.15); }
                    .bg-amber { color: #fbbf24; background: rgba(245, 158, 11, 0.15); }

                    .main-tabs {
                        display: flex;
                        gap: 1.5rem;
                        margin-bottom: 2rem;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        padding-bottom: 0.5rem;
                    }
                    .tab-link {
                        display: flex;
                        align-items: center;
                        gap: 0.6rem;
                        background: none;
                        border: none;
                        font-size: 1rem;
                        color: #94a3b8;
                        cursor: pointer;
                        padding: 0.8rem 1rem;
                        border-radius: 8px;
                        transition: 0.3s;
                        font-weight: 600;
                        position: relative;
                    }
                    .tab-link:hover { color: #fff; background: rgba(255,255,255,0.03); }
                    .tab-link.active { color: #fff; background: rgba(255,255,255,0.08); }
                    .tab-link.active::after {
                        content: '';
                        position: absolute;
                        bottom: -8px;
                        left: 0;
                        width: 100%;
                        height: 3px;
                        background: #6366f1;
                        border-radius: 2px;
                    }

                    .full-table { padding: 1.5rem; }
                    .table-header-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1.5rem;
                    }
                    .search-mini {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        background: rgba(0,0,0,0.2);
                        padding: 0.6rem 1rem;
                        border-radius: 10px;
                        border: 1px solid rgba(255,255,255,0.1);
                    }
                    .search-mini input {
                        border: none;
                        background: none;
                        color: #fff;
                        outline: none;
                        width: 150px;
                    }

                    table { width: 100%; border-collapse: separate; border-spacing: 0; }
                    th {
                        text-align: left;
                        padding: 1rem;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        color: #cbd5e1;
                        font-size: 0.85rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    td {
                        padding: 1.2rem 1rem;
                        border-bottom: 1px solid rgba(255,255,255,0.03);
                        font-size: 0.95rem;
                        color: #e2e8f0;
                        vertical-align: middle;
                    }
                    tr:last-child td { border-bottom: none; }
                    
                    .party-cell { display: flex; align-items: center; gap: 0.6rem; }
                    .prod-col span { display: block; }
                    .sku-tag { font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem; }
                    .text-success { color: #34d399; }
                    .text-primary { color: #818cf8; }
                    
                    .health-badge {
                        padding: 0.3rem 0.6rem;
                        border-radius: 6px;
                        font-size: 0.7rem;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                    }
                    .health-badge.low { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
                    .health-badge.good { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
                    
                    .badge { padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
                    .badge-paid { background: rgba(16, 185, 129, 0.2); color: #34d399; }
                    .badge-pending { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }

                    /* MODAL STYLES */
                    .modal-root {
                        position: fixed;
                        inset: 0;
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        perspective: 1000px;
                    }
                    .modal-backdrop {
                        position: absolute;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.7);
                        backdrop-filter: blur(8px);
                    }
                    .modal-content-glass {
                        position: relative;
                        z-index: 1001;
                        background: rgba(30, 41, 59, 0.95);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 24px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }
                    .modal-content-glass.large { width: 95vw; max-width: 1400px; height: 90vh; }
                    .modal-content-glass.medium { width: 90vw; max-width: 600px; padding: 2rem; }
                    
                    .pos-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1.5rem 2rem;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        background: rgba(0,0,0,0.1);
                    }
                    .pos-title { display: flex; align-items: center; gap: 1rem; }
                    .pos-icon-box {
                        width: 44px;
                        height: 44px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .pos-icon-box.inward {
                        background: linear-gradient(135deg, #6366f1, #818cf8);
                        color: white;
                        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                    }
                    .pos-title h2 { margin: 0; font-size: 1.4rem; color: #fff; }
                    .close-btn {
                        background: none;
                        border: none;
                        color: #94a3b8;
                        cursor: pointer;
                        padding: 0.5rem;
                        border-radius: 8px;
                        transition: 0.2s;
                    }
                    .close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

                    .pos-form {
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        overflow: hidden;
                        padding: 0;
                        flex: 1;
                    }
                    .pos-meta-grid {
                        display: grid;
                        grid-template-columns: 2fr 1fr 1fr 1fr;
                        gap: 1.5rem;
                        padding: 1.5rem 2rem;
                        background: rgba(255,255,255,0.01);
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                    }
                    .input-control {
                        width: 100%;
                        background: #0f172a;
                        border: 1px solid rgba(255,255,255,0.15);
                        padding: 0.8rem;
                        border-radius: 8px;
                        color: #fff;
                        font-size: 0.95rem;
                        transition: 0.2s;
                    }
                    .input-control:focus {
                        border-color: #6366f1;
                        outline: none;
                        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
                    }
                    
                    .pos-items-area {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        padding: 1rem 2rem;
                    }
                    .area-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1rem;
                    }
                    .btn-secondary-small {
                        padding: 0.5rem 1rem;
                        background: rgba(255,255,255,0.08);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 6px;
                        color: #fff;
                        font-size: 0.85rem;
                        cursor: pointer;
                        transition: 0.2s;
                    }
                    .btn-secondary-small:hover { background: rgba(255,255,255,0.15); }
                    
                    .table-responsive-scroll {
                        flex: 1;
                        overflow-y: auto;
                        overflow-x: auto;
                        background: rgba(0,0,0,0.15);
                        border-radius: 12px;
                        border: 1px solid rgba(255,255,255,0.05);
                    }
                    .pos-items-table th {
                        background: rgba(30, 41, 59, 0.9);
                        position: sticky;
                        top: 0;
                        z-index: 10;
                        font-size: 0.75rem;
                    }
                    .pos-items-table td { padding: 0.6rem 0.8rem; font-size: 0.9rem; }
                    
                    .pos-bottom-section {
                        background: rgba(15, 23, 42, 0.6);
                        border-top: 1px solid rgba(255,255,255,0.1);
                        padding: 1.5rem 2rem;
                        display: grid;
                        grid-template-columns: 1fr 400px;
                        gap: 2rem;
                        margin-top: auto;
                    }
                    .file-upload-box { margin-bottom: 1rem; }
                    .pos-summary-box {
                        background: rgba(255,255,255,0.03);
                        border: 1px solid rgba(255,255,255,0.05);
                        border-radius: 12px;
                        padding: 1.5rem;
                    }
                    .sum-line {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 0.8rem;
                        color: #cbd5e1;
                        font-size: 0.95rem;
                    }
                    .sum-line-total {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 1rem;
                        padding-top: 1rem;
                        border-top: 1px solid rgba(255,255,255,0.1);
                        font-size: 1.4rem;
                        font-weight: 800;
                        color: #818cf8;
                    }
                    
                    .btn-save-bill {
                        width: 100%;
                        margin-top: 1.5rem;
                        padding: 1rem;
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-weight: 700;
                        font-size: 1.1rem;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.8rem;
                        transition: 0.2s;
                        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                    }
                    .btn-save-bill:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
                    }

                    .bill-footer-summary {
                        border-top: 1px solid rgba(255,255,255,0.1);
                        padding-top: 1.5rem;
                        margin-top: 1rem;
                        display: flex;
                        justify-content: flex-end;
                    }
                    .flex-between {
                        display: flex;
                        justify-content: space-between;
                        width: 250px;
                        margin-bottom: 0.5rem;
                        color: #cbd5e1;
                    }
                    .grand-total {
                        font-weight: 800;
                        font-size: 1.2rem;
                        color: #818cf8;
                        border-top: 1px solid rgba(255,255,255,0.1);
                        padding-top: 0.5rem;
                        margin-top: 0.5rem;
                    }
                    
                    .grid-2, .grid-2-bw { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                    .f-group label { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.4rem; }
                    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
                    
                    /* Utility Styles */
                    .row-flex { display: flex; gap: 0.5rem; }
                    .row-select, .row-input { width: 100%; border: none; background: transparent; color: #fff; padding: 0.3rem; }
                    .row-select { background: #1e293b; border-radius: 4px; }

                    .row-img-upload {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 40px;
                        height: 40px;
                        border-radius: 6px;
                        border: 1px dashed rgba(255,255,255,0.3);
                        background: rgba(0,0,0,0.2);
                        cursor: pointer;
                        overflow: hidden;
                        transition: 0.3s;
                    }
                    .row-img-upload:hover {
                        border-color: #818cf8;
                        background: rgba(99, 102, 241, 0.1);
                    }
                    .row-img-preview {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .row-img-placeholder {
                        color: #94a3b8;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                `}</style>
            </motion.div>
        );
    } catch (e) {
        setRenderError(e);
        return null;
    }
};

export default Bills;
