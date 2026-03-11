import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    Search,
    ShoppingCart,
    CheckCircle,
    AlertCircle,
    Package,
    X,
    User,
    Calculator,
    Building2,
    Phone,
    Calendar
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const OrderPlacement = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchClient, setSearchClient] = useState('');
    const [searchProduct, setSearchProduct] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [showClientList, setShowClientList] = useState(false);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Calculations
    const [totals, setTotals] = useState({
        subTotal: 0,
        discount: 0,
        tax: 0,
        grandTotal: 0
    });

    useEffect(() => {
        fetchClients();
        fetchProducts();
    }, []);

    useEffect(() => {
        calculateTotals();
    }, [orderItems]);

    const fetchClients = async (query = '') => {
        try {
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/clients.php?search=${query}`);
            if (response.data.success) {
                setClients(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const fetchProducts = async (query = '') => {
        try {
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/products.php?search=${query}`);
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const calculateTotals = () => {
        let sub = 0;
        let disc = 0;
        let tax = 0;

        orderItems.forEach(item => {
            const amount = item.unit_price * item.quantity;
            const itemDisc = amount * (item.discount_percent / 100);
            const afterDisc = amount - itemDisc;
            const itemTax = afterDisc * (item.gst_percent / 100);

            sub += amount;
            disc += itemDisc;
            tax += itemTax;
        });

        setTotals({
            subTotal: sub,
            discount: disc,
            tax: tax,
            grandTotal: sub - disc + tax
        });
    };

    const addItem = (product) => {
        const existing = orderItems.find(item => item.product_id === product.id);
        if (existing) {
            updateQuantity(product.id, existing.quantity + 1);
        } else {
            setOrderItems([...orderItems, {
                product_id: product.id,
                product_name: product.name,
                unit_price: product.sale_price,
                quantity: 1,
                discount_percent: 0,
                gst_percent: product.gst_percent || 0,
                stock: product.stock_quantity,
                total_amount: product.sale_price
            }]);
        }
        setSearchProduct('');
    };

    const removeItem = (id) => {
        setOrderItems(orderItems.filter(item => item.product_id !== id));
    };

    const updateQuantity = (id, val) => {
        const item = orderItems.find(i => i.product_id === id);
        if (val > item.stock) {
            setErrorMessage(`Only ${item.stock} units available for ${item.product_name}`);
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        setOrderItems(orderItems.map(item => {
            if (item.product_id === id) {
                const qty = Math.max(1, parseFloat(val) || 0);
                return {
                    ...item,
                    quantity: qty,
                    total_amount: qty * item.unit_price * (1 - (item.discount_percent / 100)) * (1 + (item.gst_percent / 100))
                };
            }
            return item;
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClient) {
            setErrorMessage("Please select a client");
            return;
        }
        if (orderItems.length === 0) {
            setErrorMessage("Please add at least one product");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                salesman_id: user.id,
                client_id: selectedClient.id,
                sub_total: totals.subTotal,
                discount_amount: totals.discount,
                tax_amount: totals.tax,
                total_amount: totals.grandTotal,
                status: 'Pending',
                items: orderItems
            };

            const response = await axios.post('http://localhost/sales_manage/backend/api/salesman/orders.php', payload);
            if (response.data.success) {
                setSuccessMessage(`Order #${response.data.order_number} placed successfully!`);
                setOrderItems([]);
                setSelectedClient(null);
                setTotals({ subTotal: 0, discount: 0, tax: 0, grandTotal: 0 });
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            setErrorMessage("Connection error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="order-placement p-4 lg:p-8">
            <Helmet>
                <title>Place New Order | HAB CREATION</title>
            </Helmet>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">New Order Placement</h1>
                    <p className="text-gray-400 mt-1">Select a client and add products to create a new order.</p>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-indigo-400 font-medium">
                    <Calendar size={18} />
                    {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Client & Product Selection */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Client Selection */}
                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <User className="text-indigo-400" size={20} />
                            1. Customer Selection
                        </h3>

                        <div className="relative">
                            {!selectedClient ? (
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Search size={20} />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search client by name, company or phone..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-indigo-500/50 transition-all"
                                        value={searchClient}
                                        onChange={(e) => {
                                            setSearchClient(e.target.value);
                                            fetchClients(e.target.value);
                                            setShowClientList(true);
                                        }}
                                        onFocus={() => setShowClientList(true)}
                                    />

                                    {showClientList && clients.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#121826] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                            {clients.map(client => (
                                                <div
                                                    key={client.id}
                                                    className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                                                    onClick={() => {
                                                        setSelectedClient(client);
                                                        setShowClientList(false);
                                                        setSearchClient('');
                                                    }}
                                                >
                                                    <h4 className="text-white font-medium">{client.name}</h4>
                                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1"><Building2 size={12} /> {client.company || 'Private'}</span>
                                                        <span className="flex items-center gap-1"><Phone size={12} /> {client.phone}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                                            {selectedClient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">{selectedClient.name}</h4>
                                            <p className="text-indigo-300 text-sm">{selectedClient.company || 'Retail Client'} • {selectedClient.city}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedClient(null)}
                                        className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Product Selection */}
                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Package className="text-emerald-400" size={20} />
                            2. Add Products
                        </h3>

                        <div className="relative mb-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Search size={20} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search products by name or SKU..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-indigo-500/50 transition-all"
                                value={searchProduct}
                                onChange={(e) => {
                                    setSearchProduct(e.target.value);
                                    fetchProducts(e.target.value);
                                }}
                            />

                            {searchProduct && products.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#121826] border border-white/10 rounded-xl shadow-2xl z-40 max-h-60 overflow-y-auto custom-scrollbar">
                                    {products.map(product => (
                                        <div
                                            key={product.id}
                                            className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer flex justify-between items-center group transition-colors"
                                            onClick={() => addItem(product)}
                                        >
                                            <div>
                                                <h4 className="text-white font-medium group-hover:text-indigo-400 transition-colors">{product.name}</h4>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                                    <span>SKU: {product.sku}</span>
                                                    <span className={product.stock_quantity > 0 ? "text-emerald-500" : "text-rose-500"}>
                                                        Stock: {product.stock_quantity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-bold">₹{product.sale_price}</div>
                                                <div className="text-[10px] text-gray-500">+{product.gst_percent}% GST</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Products Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                                        <th className="pb-4 font-medium">Product</th>
                                        <th className="pb-4 font-medium text-center">Unit Price</th>
                                        <th className="pb-4 font-medium text-center">Quantity</th>
                                        <th className="pb-4 font-medium text-center">Disc%</th>
                                        <th className="pb-4 font-medium text-right">Total</th>
                                        <th className="pb-4 font-medium text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <AnimatePresence>
                                        {orderItems.map(item => (
                                            <motion.tr
                                                key={item.product_id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="group"
                                            >
                                                <td className="py-4">
                                                    <p className="text-white font-medium">{item.product_name}</p>
                                                    <p className="text-[10px] text-gray-500">Includes {item.gst_percent}% GST</p>
                                                </td>
                                                <td className="py-4 text-center text-gray-300">₹{item.unit_price}</td>
                                                <td className="py-4 text-center">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                                                        >-</button>
                                                        <span className="w-8 text-center text-white">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                                                        >+</button>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <input
                                                        type="number"
                                                        className="w-16 bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-center text-white outline-none"
                                                        value={item.discount_percent}
                                                        onChange={(e) => {
                                                            const disc = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                                            setOrderItems(orderItems.map(i => i.product_id === item.product_id ? { ...i, discount_percent: disc } : i));
                                                        }}
                                                    />
                                                </td>
                                                <td className="py-4 text-right text-white font-bold">
                                                    ₹{(item.unit_price * item.quantity * (1 - item.discount_percent / 100)).toFixed(2)}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => removeItem(item.product_id)}
                                                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>

                                    {orderItems.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <ShoppingCart size={40} className="text-white/10" />
                                                    <p>No products added yet.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <section className="bg-indigo-600 rounded-3xl p-8 sticky top-8 text-white shadow-2xl shadow-indigo-900/40">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <Calculator size={24} />
                            Order Summary
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-indigo-100">
                                <span>Sub Total</span>
                                <span>₹{totals.subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-indigo-200">
                                <span>Discount</span>
                                <span className="text-emerald-300">- ₹{totals.discount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-indigo-200">
                                <span>Total Tax (GST)</span>
                                <span>₹{totals.tax.toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t border-white/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">Grand Total</span>
                                    <span className="text-3xl font-black">₹{totals.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Order Notes</label>
                                <textarea
                                    className="w-full bg-white/10 border border-white/20 rounded-xl mt-2 p-3 text-white placeholder-indigo-300/50 outline-none focus:bg-white/15 transition-all text-sm h-24 resize-none"
                                    placeholder="Any special instructions..."
                                ></textarea>
                            </div>

                            <button
                                disabled={submitting || orderItems.length === 0}
                                onClick={handleSubmit}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${submitting || orderItems.length === 0 ? 'bg-indigo-400 cursor-not-allowed opacity-50' : 'bg-white text-indigo-600 hover:scale-[1.02] active:scale-[0.98]'}`}
                            >
                                {submitting ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        Place Order
                                    </>
                                )}
                            </button>
                        </div>
                    </section>

                    {/* Messages */}
                    <div className="mt-4">
                        <AnimatePresence>
                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-500 flex items-center gap-3"
                                >
                                    <CheckCircle size={20} />
                                    {successMessage}
                                </motion.div>
                            )}
                            {errorMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-500 flex items-center gap-3"
                                >
                                    <AlertCircle size={20} />
                                    {errorMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }
      `}</style>
        </div>
    );
};

// End of component

export default OrderPlacement;
