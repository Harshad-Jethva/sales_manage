import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Building2, UserCircle, ArrowRight, Wallet, Receipt, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../../components/common/SEO';

const ClientBills = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [clientsRes, billsRes] = await Promise.all([
                axios.get('http://localhost/sales_manage/backend/api/clients.php'),
                axios.get('http://localhost/sales_manage/backend/api/bills.php')
            ]);

            setClients(Array.isArray(clientsRes.data) ? clientsRes.data : []);

            const salesBills = (billsRes.data || []).filter(b => b.bill_type === 'sale');
            setBills(salesBills);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate aggregated bill stats per client
    const clientStats = clients.map(client => {
        const clientBills = bills.filter(b =>
            (b.client_id && parseInt(b.client_id) === parseInt(client.id)) ||
            (b.customer_id && parseInt(b.customer_id) === parseInt(client.id))
        );
        let pendingAmount = 0;
        let paidAmount = 0;
        let pendingCount = 0;
        let paidCount = 0;

        clientBills.forEach(bill => {
            const total = parseFloat(bill.total_amount || 0);
            const paid = parseFloat(bill.paid_amount || 0);
            // If the bill has status pending or partial, track the remaining pending
            // Even if status is somewhat inaccurate, recalculate based on total vs paid
            if (paid < total) {
                pendingAmount += (total - paid);
                pendingCount++;
            }
            if (paid > 0) {
                paidAmount += paid;
            }
            if (paid >= total) {
                paidCount++;
            }
        });

        return { ...client, pendingAmount, paidAmount, pendingCount, paidCount, totalBills: clientBills.length };
    });

    // Add a synthetic "Walk-in" client for bills with no client/customer association
    const walkInBills = bills.filter(b => !b.customer_id && !b.client_id);
    if (walkInBills.length > 0) {
        let pAmt = 0, pdAmt = 0, pCnt = 0, pdCnt = 0;
        walkInBills.forEach(bill => {
            const total = parseFloat(bill.total_amount || 0);
            const paid = parseFloat(bill.paid_amount || 0);
            if (paid < total) { pAmt += (total - paid); pCnt++; }
            if (paid > 0) { pdAmt += paid; }
            if (paid >= total) { pdCnt++; }
        });
        clientStats.unshift({
            id: 'walk-in',
            name: 'Walk-in Customer',
            phone: 'N/A',
            shop_name: 'N/A',
            pendingAmount: pAmt,
            paidAmount: pdAmt,
            pendingCount: pCnt,
            paidCount: pdCnt,
            totalBills: walkInBills.length
        });
    }

    // Filter Logic
    const filteredClients = clientStats.filter(c => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const clientName = (c.name || '').toLowerCase();
            const shopName = (c.shop_name || '').toLowerCase();
            const phone = (c.phone || '').toLowerCase();
            const clientIdStr = c.id !== 'walk-in' ? c.id.toString().padStart(3, '0') : '';
            const plainId = c.id !== 'walk-in' ? c.id.toString() : '';

            if (
                !clientName.includes(term) &&
                !shopName.includes(term) &&
                !phone.includes(term) &&
                !clientIdStr.includes(term) &&
                !plainId.includes(term)
            ) {
                return false;
            }
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-[#111827] text-gray-200 p-6 animate-fade-in">
            <SEO title="Client Ledgers | POS" description="View client profiles and their respective pending/payable bills." />

            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Client Bills & Ledger</h1>
                    <p className="text-gray-400 mt-1">Search for clients to view their profiles along with pending and completed bill details.</p>
                </div>
                <button
                    onClick={() => navigate('/pos/all-bills')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all font-medium"
                >
                    <Receipt size={18} />
                    View All Transaction History
                </button>
            </div>

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 mb-8 flex flex-wrap gap-4 items-end backdrop-blur-md">
                <div className="flex-1 min-w-[300px]">
                    <label className="block text-sm text-gray-400 mb-2 font-medium">Search Client Profile</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID (e.g., 005), name, shop, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Client Ledger Cards */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 animate-pulse">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        Fetching client profiles and ledger...
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
                        <UserCircle size={48} className="mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium mb-1">No clients found</h3>
                        <p>No client profiles match your current search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredClients.map((client, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={client.id}
                                className="bg-gray-800/80 border border-gray-700/60 rounded-xl overflow-hidden shadow-lg hover:border-indigo-500/30 transition-colors flex flex-col"
                            >
                                <div className="p-5 border-b border-gray-700/50 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-100 truncate">{client.name}</h3>
                                        <p className="text-sm text-gray-400 truncate">{client.shop_name || client.phone || 'No Contact Details'}</p>
                                    </div>
                                    <div className="shrink-0 bg-gray-900 border border-gray-700 px-3 py-1 rounded-md text-xs font-mono text-gray-400">
                                        ID: {client.id === 'walk-in' ? '-' : client.id.toString().padStart(3, '0')}
                                    </div>
                                </div>

                                <div className="p-5 flex-1 grid grid-cols-2 gap-4">
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-amber-500 mb-1">
                                            <Receipt size={14} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
                                        </div>
                                        <div className="text-xl font-bold text-amber-400 m-0">₹{client.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        <div className="text-xs text-amber-500/70 mt-1">{client.pendingCount} unpaid bills</div>
                                    </div>

                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-emerald-500 mb-1">
                                            <Wallet size={14} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Paid</span>
                                        </div>
                                        <div className="text-xl font-bold text-emerald-400 m-0">₹{client.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        <div className="text-xs text-emerald-500/70 mt-1">{client.paidCount} completed bills</div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-900/50 border-t border-gray-700/50">
                                    <button
                                        onClick={() => navigate('/pos/client-profile', { state: { client } })}
                                        disabled={client.id === 'walk-in'}
                                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all ${client.id === 'walk-in'
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50'
                                            : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                            }`}
                                    >
                                        <UserCircle size={18} />
                                        {client.id === 'walk-in' ? 'Walk-in Details' : 'View Profile & Bills'}
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientBills;
