import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Printer, Download, PlusCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const InvoiceSuccessModal = ({ isOpen, bill, onNewBill, onClose }) => {
    if (!isOpen || !bill) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('invoice-print');
        if (!element) return;

        // Temporarily make it visible for html2canvas to capture properly
        const originalClass = element.className;
        element.className = 'flex flex-col bg-white text-black font-sans mx-auto p-[3mm] box-border w-[800px] h-[1130px] overflow-hidden fixed top-0 left-[-9999px] z-[-1]';

        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${bill.billNo || '1'}.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            // Restore original className
            element.className = originalClass;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-emerald-500/30 w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400"></div>

                <div className="p-8 flex flex-col items-center text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2"
                    >
                        <CheckCircle size={40} className="text-emerald-400" />
                    </motion.div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Invoice Saved!</h2>
                        <p className="text-gray-400 text-sm">Bill <span className="text-emerald-400 font-mono font-bold">{bill.billNo}</span> has been processed securely.</p>
                    </div>

                    <div className="w-full bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Total Amount</span>
                            <span className="text-white font-mono font-bold">₹{bill.finalTotal?.toFixed(2)}</span>
                        </div>
                        {bill.dueAmount > 0 && (
                            <div className="flex justify-between items-center text-amber-400">
                                <span className="text-sm">Due Balance</span>
                                <span className="font-mono font-bold">₹{bill.dueAmount?.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    <div className="w-full grid gap-3 pt-2">
                        <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all border border-gray-700 hover:border-gray-500 font-medium group"
                        >
                            <Printer size={18} className="text-gray-400 group-hover:text-white" />
                            <span>Print Invoice</span>
                        </button>

                        <button
                            onClick={handleDownloadPDF}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-xl transition-all border border-indigo-500/30 hover:border-indigo-500/50 font-medium group"
                        >
                            <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                            <span>Download PDF</span>
                        </button>

                        <button
                            onClick={() => {
                                onNewBill();
                                onClose();
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/25 font-bold"
                        >
                            <PlusCircle size={18} />
                            <span>Generate New Bill</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default InvoiceSuccessModal;
