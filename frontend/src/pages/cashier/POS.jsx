import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Home, RotateCcw, Save, Trash2, Printer, Search, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import New Components
import TransactionTable from '../../components/pos/TransactionTable';
import CustomerDetailsPanel from '../../components/pos/CustomerDetailsPanel';
import ShippingDetailsPanel from '../../components/pos/ShippingDetailsPanel';
import FooterTotals from '../../components/pos/FooterTotals';
import PaymentModal from '../../components/pos/PaymentModal';
import InvoiceTemplate from '../../components/pos/InvoiceTemplate';
import gsap from 'gsap';
import SEO from '../../components/common/SEO';

const POS = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data
    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Bill State
    const [billNo, setBillNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
    const [session, setSession] = useState(1);
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);

    // Cart & Customer
    const [cart, setCart] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [shippingDetails, setShippingDetails] = useState({});
    const [totals, setTotals] = useState({ subTotal: 0, taxTotal: 0, discountAmount: 0, finalTotal: 0 });
    const [lastTendered, setLastTendered] = useState(null);

    // UI State
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // Global Product Search
    const [filteredProducts, setFilteredProducts] = useState([]);
    const containerRef = useRef(null);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, clientRes] = await Promise.all([
                    axios.get('http://localhost/sales_manage/backend/api/products.php'),
                    axios.get('http://localhost/sales_manage/backend/api/clients.php')
                ]);
                setProducts(prodRes.data || []);
                // If the API returns {success: true, data: [...]}, use data.data
                const clientsData = Array.isArray(clientRes.data) ? clientRes.data : (clientRes.data?.data || []);
                setClients(clientsData);
            } catch (err) {
                console.error("Failed to load POS data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(
                gsap.utils.toArray('.pos-anim-el', containerRef.current),
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }
            );
        }
    }, [loading]);

    // Update Totals whenever Cart changes
    useEffect(() => {
        const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const taxTotal = cart.reduce((acc, item) => acc + (item.price * item.qty * (item.gst_percent || 0) / 100), 0);
        const discountAmount = cart.reduce((acc, item) => acc + (item.price * item.qty * (item.discountPercent || 0) / 100), 0);

        // Global discount logic can be added here if needed, currently per item

        const finalTotal = subTotal + taxTotal - discountAmount;
        setTotals({ subTotal, taxTotal, discountAmount, finalTotal });
    }, [cart]);

    // Handle Product Search
    useEffect(() => {
        if (!searchTerm) {
            setFilteredProducts([]);
            return;
        }
        const results = products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10); // Limit results
        setFilteredProducts(results);
    }, [searchTerm, products]);


    // Cart Operations
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, {
                id: product.id,
                sku: product.sku,
                name: product.name,
                mrp: parseFloat(product.mrp || product.sale_price),
                price: parseFloat(product.sale_price),
                qty: 1,
                gst_percent: parseFloat(product.gst_percent || 0),
                discountPercent: 0
            }];
        });
        setSearchTerm(''); // Clear search after add
        setFilteredProducts([]);
    };

    const updateQty = (id, qty, discountPercent) => {
        if (qty < 1) return;
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    qty: qty !== undefined ? qty : item.qty,
                    discountPercent: discountPercent !== undefined ? discountPercent : item.discountPercent
                };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

    // Payment
    const handleCheckout = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentConfirm = async (paymentDetails) => {
        const payload = {
            bill_type: 'sale',
            client_id: selectedClient?.id || null,
            bill_number: billNo,
            sub_total: totals.subTotal,
            discount_amount: totals.discountAmount,
            tax_amount: totals.taxTotal,
            total_amount: totals.finalTotal,
            paid_amount: paymentDetails.paidAmount,
            payment_method: paymentDetails.method,
            status: paymentDetails.status,
            bill_date: billDate,
            items: cart.map(item => ({
                product_id: item.id,
                name: item.name,
                qty: item.qty,
                price: item.price,
                gst_percent: item.gst_percent,
                total: item.price * item.qty
            }))
        };

        try {
            const res = await axios.post('http://localhost/sales_manage/backend/api/bills.php', payload);
            if (res.data.success) {
                setLastTendered(paymentDetails.paidAmount);
                setShowPaymentModal(false);

                if (paymentDetails.printInvoice) {
                    setTimeout(() => {
                        window.print();
                        // Delay clearing the cart slightly more to let print dialog grab DOM
                        setTimeout(() => {
                            setCart([]);
                            setSelectedClient(null);
                            setBillNo(`INV-${Date.now().toString().slice(-6)}`);
                        }, 1000);
                    }, 500);
                } else {
                    setCart([]);
                    setSelectedClient(null);
                    setBillNo(`INV-${Date.now().toString().slice(-6)}`);
                }
            } else {
                alert("Server Error: " + (res.data.error || "Unknown error occurred while saving."));
            }
        } catch (err) {
            console.error("POS Save Error:", err);
            const errorMsg = err.response?.data?.error || err.message || "Network error";
            alert("Failed to save bill: " + errorMsg);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] w-full bg-[#111827] rounded-2xl shadow-2xl border border-gray-800 text-gray-300 font-sans overflow-hidden animate-fade-in" ref={containerRef}>
            <SEO title="Point of Sale" description="Fast and easy retail point of sale module." />
            {/* 1. Top Toolbar */}
            <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 pos-anim-el">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} title="Exit" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors flex items-center justify-center text-red-400 hover:text-red-300">
                        <Home size={18} />
                        <span className="text-xs font-bold uppercase ml-1">Exit</span>
                    </button>
                    <div className="h-6 w-px bg-gray-700 mx-2"></div>
                    <button title="New Bill" onClick={() => setCart([])} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors flex items-center justify-center">
                        <RotateCcw size={18} />
                    </button>
                    <button title="Print Last Bill" onClick={() => window.print()} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors flex items-center justify-center">
                        <Printer size={18} />
                    </button>
                    <button title="View All Bills" onClick={() => navigate('/pos/all-bills')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors flex items-center justify-center">
                        <Receipt size={18} />
                        <span className="text-xs font-bold uppercase ml-1 hidden md:inline">Bills</span>
                    </button>
                    <div className="h-6 w-px bg-gray-700 mx-2"></div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                    <span>Logged in: <span className="text-yellow-500">{user?.name}</span></span>
                    <span>ver 2.0</span>
                    <span className="text-gray-600">DB: {products.length}</span>
                </div>
            </div>

            {/* 2. Info Panels (Customer, Shipping, Meta) */}
            <div className="h-auto min-h-[12rem] shrink-0 grid grid-cols-12 gap-1 p-1 bg-gray-900 border-b border-gray-700 pos-anim-el">

                {/* Customer - Left / Center Left */}
                <div className="col-span-4 h-full">
                    <CustomerDetailsPanel
                        client={selectedClient}
                        onClientSelect={(c) => {
                            setSelectedClient(c);
                            if (c) setShippingDetails({ name: c.name, address: c.address, phone: c.phone, city: c.city });
                        }}
                        clients={clients}
                    />
                </div>

                {/* Shipping - Center */}
                <div className="col-span-4 h-full">
                    <ShippingDetailsPanel shipping={shippingDetails} onChange={setShippingDetails} />
                </div>

                {/* Bill Meta - Right */}
                <div className="col-span-4 h-full bg-gray-800/60 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-right space-y-2">
                        <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-700">
                            <span className="text-xs text-gray-400 uppercase font-bold">Session</span>
                            <span className="text-xl font-mono text-white font-bold">{session}</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-700">
                            <span className="text-xs text-gray-400 uppercase font-bold">Date</span>
                            <span className="text-lg font-mono text-white">{billDate}</span>
                        </div>
                        <div className="flex justify-between items-center bg-yellow-900/20 p-2 rounded border border-yellow-700/50">
                            <span className="text-xs text-yellow-500 uppercase font-bold">Bill No</span>
                            <span className="text-xl font-mono text-yellow-400 font-bold">{billNo}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Transaction Grid (Main) */}
            <div className="flex-1 flex overflow-hidden p-2 gap-2 pos-anim-el">
                {/* Table takes 9 columns */}
                <div className="flex-1 h-full flex flex-col">
                    <TransactionTable
                        cart={cart}
                        onUpdateQty={updateQty}
                        onRemove={removeFromCart}
                        products={products}
                        onAddItem={addToCart}
                    />
                </div>

                {/* Totals Sidebar takes 3 columns (fixed width) */}
                <div className="w-64 h-full">
                    <FooterTotals
                        totals={totals}
                        lastTendered={lastTendered}
                        cartCount={cart.length}
                        onCheckout={handleCheckout}
                    />
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showPaymentModal && (
                    <PaymentModal
                        isOpen={showPaymentModal}
                        onClose={() => setShowPaymentModal(false)}
                        total={totals.finalTotal}
                        onConfirm={handlePaymentConfirm}
                        selectedClient={selectedClient}
                    />
                )}
            </AnimatePresence>

            {/* Print Template */}
            <InvoiceTemplate bill={{ ...totals, billNo, cart, selectedClient, cashier: user?.name }} />
        </div>
    );
};

export default POS;
