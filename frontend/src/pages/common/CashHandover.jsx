import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Printer, Save, Download, Calculator, AlertTriangle, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './CashHandover.css';
import { useNavigate } from 'react-router-dom';

const CashHandover = ({ panelName = 'POS' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('Cash');
    const [loading, setLoading] = useState(false);

    // Denominations state
    const [denominations, setDenominations] = useState([
        { value: 2000, count: 0 },
        { value: 1000, count: 0 },
        { value: 500, count: 0 },
        { value: 200, count: 0 },
        { value: 100, count: 0 },
        { value: 50, count: 0 },
        { value: 20, count: 0 },
        { value: 10, count: 0 },
        { value: 5, count: 0 },
        { value: 2, count: 0 },
        { value: 1, count: 0 }
    ]);

    // Financial states
    const [openingBalance, setOpeningBalance] = useState(0);
    const [pettyCash, setPettyCash] = useState(0);
    const [expectedBalance, setExpectedBalance] = useState(0);
    const [notes, setNotes] = useState('');

    // Other payment methods
    const [payments, setPayments] = useState({
        creditCard: 0,
        cheque: 0,
        coupon: 0,
        discountCoupon: 0
    });

    // Fetch expected balance on date change
    useEffect(() => {
        const fetchExpected = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/cash_handover.php?action=get_expected&date=${date}`, {
                    headers: { Authorization: `Bearer ${user.session_token}` }
                });
                if (response.data.success) {
                    setExpectedBalance(response.data.expected_cash);
                }
            } catch (error) {
                console.error("Error fetching expected balance", error);
            }
        };
        fetchExpected();
    }, [date, user.session_token]);

    const handleCountChange = (value, count) => {
        if (count < 0) return;
        setDenominations(prev => prev.map(d => d.value === value ? { ...d, count: parseInt(count) || 0 } : d));
    };

    const handlePaymentChange = (key, value) => {
        if (value < 0) return;
        setPayments(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
    };

    const calculateTotalCash = () => {
        return denominations.reduce((acc, curr) => acc + (curr.value * curr.count), 0);
    };

    const totalCash = calculateTotalCash();
    const expectedTotal = (parseFloat(openingBalance) || 0) + (parseFloat(pettyCash) || 0) + (parseFloat(expectedBalance) || 0);
    const difference = totalCash - expectedTotal;

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                counter_name: panelName,
                handover_date: date,
                total_cash: totalCash,
                opening_balance: openingBalance,
                petty_cash: pettyCash,
                expected_balance: expectedBalance,
                difference: difference,
                denomination_data: denominations,
                payment_data: payments,
                notes: notes
            };

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/cash_handover.php`, payload, {
                headers: { Authorization: `Bearer ${user.session_token}` }
            });

            if (response.data.success) {
                toast.success("Cash handover saved successfully!");
            } else {
                toast.error(response.data.message || "Failed to save");
            }
        } catch (error) {
            console.error("Save error:", error);
            const errorMsg = error.response?.data?.message || error.message || "An error occurred while saving";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // --- HEADER ---
        doc.setFillColor(30, 41, 59); // Slate 800
        doc.rect(0, 0, 210, 45, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("HAB CREATION", 105, 20, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("DAILY CASH HANDOVER REPORT", 105, 30, { align: "center" });
        doc.text(`Report ID: CH-${Date.now().toString().slice(-6)}`, 105, 38, { align: "center" });

        // --- INFO SECTION ---
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);

        const topY = 55;
        doc.setFont("helvetica", "bold");
        doc.text("Report Details", 20, topY);
        doc.setFont("helvetica", "normal");
        doc.line(20, topY + 2, 190, topY + 2);

        doc.text(`Handover Date:`, 20, topY + 10);
        doc.setFont("helvetica", "bold");
        doc.text(`${date}`, 60, topY + 10);

        doc.setFont("helvetica", "normal");
        doc.text(`Counter/Panel:`, 20, topY + 17);
        doc.setFont("helvetica", "bold");
        doc.text(`${panelName}`, 60, topY + 17);

        doc.setFont("helvetica", "normal");
        doc.text(`User / Handed By:`, 110, topY + 10);
        doc.setFont("helvetica", "bold");
        doc.text(`${user.name}`, 150, topY + 10);

        doc.setFont("helvetica", "normal");
        doc.text(`Current Status:`, 110, topY + 17);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(difference === 0 ? [16, 185, 129] : [220, 38, 38]);
        doc.text(difference === 0 ? "MATCHED" : "MISMATCH DETECTED", 150, topY + 17);
        doc.setTextColor(30, 41, 59);

        // --- DENOMINATIONS TABLE ---
        doc.autoTable({
            startY: topY + 30,
            head: [['CURRENCY DENOMINATION', 'COUNT', 'AMOUNT (INR)']],
            body: denominations.map(d => [
                `₹ ${d.value}`,
                d.count || '0',
                `₹ ${(d.value * d.count).toLocaleString()}`
            ]),
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', halign: 'center' },
            bodyStyles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold' },
                1: { halign: 'center' },
                2: { halign: 'right' }
            }
        });

        // --- SUMMARY BAR ---
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.rect(110, finalY - 5, 80, 45, 'F');
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.rect(110, finalY - 5, 80, 45, 'S');

        doc.setFontSize(10);
        const labelsX = 115;
        const valuesX = 185;

        doc.setFont("helvetica", "normal");
        doc.text("Total Cash Handed:", labelsX, finalY + 5);
        doc.setFont("helvetica", "bold");
        doc.text(`₹ ${totalCash.toLocaleString()}`, valuesX, finalY + 5, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.text("Expected System:", labelsX, finalY + 15);
        doc.setFont("helvetica", "bold");
        doc.text(`₹ ${expectedTotal.toLocaleString()}`, valuesX, finalY + 15, { align: "right" });

        doc.line(labelsX, finalY + 20, valuesX, finalY + 20);

        doc.setFont("helvetica", "bold");
        doc.text("Difference:", labelsX, finalY + 30);
        doc.setTextColor(difference < 0 ? [220, 38, 38] : difference > 0 ? [16, 185, 129] : [30, 41, 59]);
        doc.text(`${difference < 0 ? '-' : '+'} ₹ ${Math.abs(difference).toLocaleString()}`, valuesX, finalY + 30, { align: "right" });

        // --- NOTES AREA ---
        if (notes) {
            doc.setTextColor(71, 85, 105);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text("Handover Notes:", 20, finalY);
            doc.text(doc.splitTextToSize(notes, 80), 20, finalY + 7);
        }

        // --- FOOTER / SIGNATURES ---
        const footerY = 260;
        doc.setTextColor(148, 163, 184);
        doc.text("__________________________", 20, footerY);
        doc.text("Handed By (User)", 35, footerY + 7);

        doc.text("__________________________", 130, footerY);
        doc.text("Verified By (Accounts)", 145, footerY + 7);

        doc.setFontSize(8);
        doc.text("This is a system-generated report.", 105, 280, { align: "center" });

        doc.save(`Cash_Report_${date}_${panelName}.pdf`);
    };

    return (
        <div className="cash-handover-container">
            <div className="cash-handover-card">
                <div className="header-section">
                    <div>
                        <h1>Cash Handover</h1>
                        <p className="control-label">Panel: {panelName} | User: {user.name}</p>
                    </div>
                    <div className="header-controls">
                        <div className="control-group">
                            <label className="control-label">Handover Date</label>
                            <input
                                type="date"
                                className="control-value"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="tab-system">
                    {['Cash', 'Credit Card', 'Cheque', 'Coupon', 'Discount Coupon'].map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="main-content">
                    {activeTab === 'Cash' ? (
                        <div className="count-table-container">
                            <table className="count-table">
                                <thead>
                                    <tr>
                                        <th>Denomination</th>
                                        <th>Count</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {denominations.map((d) => (
                                        <tr key={d.value} className="count-row">
                                            <td><span className="denomination-badge">₹ {d.value}</span></td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="count-input"
                                                    value={d.count === 0 ? '' : d.count}
                                                    onChange={(e) => handleCountChange(d.value, e.target.value)}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="amount-display">₹ {(d.value * d.count).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="count-table-container flex items-center justify-center min-h-[400px]">
                            <div className="text-center w-full max-w-md">
                                <h3 className="text-2xl font-bold mb-4">{activeTab} Details</h3>
                                <div className="control-group mb-6">
                                    <label className="control-label">Total Amount Collected</label>
                                    <input
                                        type="number"
                                        className="control-value w-full text-2xl py-4"
                                        value={
                                            activeTab === 'Credit Card' ? payments.creditCard :
                                                activeTab === 'Cheque' ? payments.cheque :
                                                    activeTab === 'Coupon' ? payments.coupon :
                                                        payments.discountCoupon
                                        }
                                        onChange={(e) => {
                                            const key = activeTab === 'Credit Card' ? 'creditCard' :
                                                activeTab === 'Cheque' ? 'cheque' :
                                                    activeTab === 'Coupon' ? 'coupon' :
                                                        'discountCoupon';
                                            handlePaymentChange(key, e.target.value);
                                        }}
                                    />
                                </div>
                                <p className="text-white/40 italic">Note: Enter the total sum of all receipts for {activeTab}.</p>
                            </div>
                        </div>
                    )}

                    <div className="summary-sidebar">
                        <div className="total-cash-hand-box">
                            <span className="label">Total Cash in Hand</span>
                            <div className="value">₹ {totalCash.toLocaleString()}</div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-item">
                                <span className="summary-label">Opening Balance</span>
                                <input
                                    type="number"
                                    className="count-input w-32"
                                    value={openingBalance}
                                    onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Petty Cash</span>
                                <input
                                    type="number"
                                    className="count-input w-32"
                                    value={pettyCash}
                                    onChange={(e) => setPettyCash(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Expected Balance</span>
                                <span className="summary-value text-blue-400">₹ {expectedBalance.toLocaleString()}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Difference</span>
                                <span className={`summary-value ${difference < 0 ? 'text-red-500' : difference > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                                    ₹ {difference.toLocaleString()}
                                </span>
                            </div>

                            {difference !== 0 && (
                                <div className="mismatch-warning">
                                    <AlertTriangle size={18} />
                                    <span>Cash mismatch detected. Diff: ₹ {difference.toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="summary-card">
                            <label className="control-label mb-2 block">Handover Notes</label>
                            <textarea
                                className="control-value w-full h-24 resize-none bg-black/30"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any observations or reasons for mismatch..."
                            />
                        </div>

                        <div className="action-buttons">
                            <button className="primary-btn" onClick={handleSave} disabled={loading}>
                                <Save size={20} />
                                {loading ? "Saving..." : "Save Cash Handover"}
                            </button>
                            <div className="flex gap-4">
                                <button className="secondary-btn flex-1" onClick={generatePDF}>
                                    <Download size={18} />
                                    PDF
                                </button>
                                <button className="secondary-btn flex-1" onClick={() => window.print()}>
                                    <Printer size={18} />
                                    Print
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashHandover;
