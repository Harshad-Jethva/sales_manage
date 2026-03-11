import React, { forwardRef } from 'react';
import { MapPin, Phone, Mail, Building2, Hash, CalendarDays, Wallet } from 'lucide-react';

const UniversalReceipt = forwardRef(({ receiptData, printSize = 'A4' }, ref) => {
    // Default fallback values
    const safeData = {
        receiptNumber: receiptData?.receipt_number || 'REC-000000',
        date: receiptData?.date || new Date().toISOString().split('T')[0],
        paymentMethod: receiptData?.payment_method || 'Cash',
        generatedBy: receiptData?.generated_by || 'Admin',
        client: {
            name: receiptData?.client_name || receiptData?.client?.name || 'Unknown Client',
            id: receiptData?.client_id || receiptData?.client?.id || 'N/A',
            phone: receiptData?.client_phone || receiptData?.client?.phone || 'N/A',
            email: receiptData?.client?.email || '',
            address: receiptData?.client?.address || '',
            gst: receiptData?.client?.gst_number || ''
        },
        bills: receiptData?.bills || [
            {
                bill_number: receiptData?.bill_number || 'N/A',
                bill_date: receiptData?.bill_date || 'N/A',
                original_amount: receiptData?.total_amount || parseFloat(receiptData?.collection_amount || 0) + parseFloat(receiptData?.remaining_balance || 0),
                paid_amount: receiptData?.collection_amount || 0,
                remaining_balance: receiptData?.remaining_balance || 0
            }
        ],
        summary: {
            total_bills_amount: receiptData?.summary?.total_bills_amount || parseFloat(receiptData?.collection_amount || 0) + parseFloat(receiptData?.remaining_balance || 0),
            total_collected_amount: receiptData?.summary?.total_collected_amount || receiptData?.collection_amount || 0,
            remaining_outstanding_amount: receiptData?.summary?.remaining_outstanding_amount || receiptData?.remaining_balance || 0
        },
        additional: {
            transaction_ref: receiptData?.transaction_ref || '',
            notes: receiptData?.notes || ''
        }
    };

    // Styling based on size
    const sizeClasses = {
        A4: 'w-[210mm] min-h-[297mm] p-[10mm] text-sm',
        A5: 'w-[148mm] min-h-[210mm] p-[8mm] text-xs',
        Thermal: 'w-[80mm] p-[4mm] text-[10px]'
    };

    const containerClass = sizeClasses[printSize] || sizeClasses.A4;
    const isThermal = printSize === 'Thermal';

    return (
        <div ref={ref} className={`bg-white text-slate-900 mx-auto box-border ${containerClass} font-sans print:shadow-none print:m-0`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            {/* Header Section */}
            <div className={`flex ${isThermal ? 'flex-col items-center text-center gap-2' : 'justify-between items-start'} mb-6 border-b-2 border-slate-200 pb-4`}>
                <div className={`${isThermal ? 'w-full flex flex-col items-center' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">H</div>
                        <h1 className="text-2xl font-black text-indigo-900 tracking-tight">HAB CREATION</h1>
                    </div>
                    <div className="text-slate-500 space-y-0.5">
                        <div className={`flex items-center gap-1.5 ${isThermal && 'justify-center'}`}><MapPin size={12} /> 123 Business Avenue, Tech District</div>
                        <div className={`flex items-center gap-1.5 ${isThermal && 'justify-center'}`}><Phone size={12} /> +91 9876543210</div>
                        <div className={`flex items-center gap-1.5 ${isThermal && 'justify-center'}`}><Building2 size={12} /> GST: 22AAAAA0000A1Z5</div>
                    </div>
                </div>

                <div className={`${isThermal ? 'w-full border-t border-slate-100 pt-3 mt-1 text-center' : 'text-right'}`}>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2">RECEIPT</h2>
                    <div className="space-y-1">
                        <div className={`flex items-center ${isThermal ? 'justify-center' : 'justify-end'} gap-2 text-slate-600`}><Hash size={12} /> <span className="font-bold text-slate-900">{safeData.receiptNumber}</span></div>
                        <div className={`flex items-center ${isThermal ? 'justify-center' : 'justify-end'} gap-2 text-slate-600`}><CalendarDays size={12} /> {safeData.date}</div>
                        <div className={`flex items-center ${isThermal ? 'justify-center' : 'justify-end'} gap-2 text-slate-600`}><Wallet size={12} /> {safeData.paymentMethod}</div>
                    </div>
                </div>
            </div>

            {/* Client Information Section */}
            <div className={`mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100`}>
                <h3 className="font-bold text-indigo-900 mb-3 uppercase tracking-wider text-xs border-b border-indigo-100 pb-1">Billed To</h3>
                <div className={`grid ${isThermal ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-4'}`}>
                    <div>
                        <div className="font-black text-slate-800 text-lg mb-0.5">{safeData.client.name}</div>
                        <div className="text-slate-500 font-medium text-xs mb-2">Client ID: {safeData.client.id}</div>
                        <div className="flex items-center gap-1.5 text-slate-600"><Phone size={12} /> {safeData.client.phone}</div>
                    </div>
                    <div className="space-y-1.5">
                        {safeData.client.email && <div className="flex items-center gap-1.5 text-slate-600"><Mail size={12} /> {safeData.client.email}</div>}
                        {safeData.client.address && <div className="flex items-start gap-1.5 text-slate-600"><MapPin size={12} className="mt-0.5" /> <span>{safeData.client.address}</span></div>}
                        {safeData.client.gst && <div className="flex items-center gap-1.5 text-slate-600"><Building2 size={12} /> GST: {safeData.client.gst}</div>}
                    </div>
                </div>
            </div>

            {/* Bill Collection Details */}
            <div className="mb-6">
                <h3 className="font-bold text-indigo-900 mb-3 uppercase tracking-wider text-xs border-b border-indigo-100 pb-1">Payment Details</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-3 border-b border-slate-200">Bill No.</th>
                                {!isThermal && <th className="p-3 border-b border-slate-200">Date</th>}
                                <th className="p-3 border-b border-slate-200 text-right">Amount</th>
                                <th className="p-3 border-b border-slate-200 text-right text-indigo-600">Paid</th>
                                {!isThermal && <th className="p-3 border-b border-slate-200 text-right">Balance</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {safeData.bills.map((bill, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="p-3 font-medium">#{bill.bill_number}</td>
                                    {!isThermal && <td className="p-3 text-slate-500">{bill.bill_date}</td>}
                                    <td className="p-3 text-right">₹{parseFloat(bill.original_amount).toLocaleString()}</td>
                                    <td className="p-3 text-right font-bold text-indigo-600">₹{parseFloat(bill.paid_amount).toLocaleString()}</td>
                                    {!isThermal && <td className="p-3 text-right text-red-500">₹{parseFloat(bill.remaining_balance).toLocaleString()}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Summary Section */}
            <div className={`mb-6 flex ${isThermal ? 'flex-col' : 'justify-end'} items-end`}>
                <div className={`${isThermal ? 'w-full' : 'w-1/2'} bg-slate-50 rounded-xl p-4 border border-slate-100`}>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center text-slate-600">
                            <span>Total Bills Amount:</span>
                            <span className="font-semibold text-slate-900">₹{parseFloat(safeData.summary.total_bills_amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-red-500">
                            <span>Remaining Balance:</span>
                            <span className="font-semibold">₹{parseFloat(safeData.summary.remaining_outstanding_amount).toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">Total Collected</span>
                                <span className="text-xl font-black text-indigo-600">₹{parseFloat(safeData.summary.total_collected_amount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Information Section */}
            {(safeData.additional.transaction_ref || safeData.additional.notes) && (
                <div className="mb-8 p-4 bg-yellow-50/50 rounded-xl border border-yellow-100 text-xs">
                    <h3 className="font-bold text-yellow-800 mb-2 uppercase tracking-wider border-b border-yellow-200 pb-1">Additional Information</h3>
                    {safeData.additional.transaction_ref && <div className="text-yellow-700 mb-1"><span className="font-semibold">Transaction Ref:</span> {safeData.additional.transaction_ref}</div>}
                    {safeData.additional.notes && <div className="text-yellow-700"><span className="font-semibold">Notes:</span> {safeData.additional.notes}</div>}
                    <div className="text-yellow-700 mt-1"><span className="font-semibold">Generated By:</span> {safeData.generatedBy}</div>
                </div>
            )}

            {/* Footer Section */}
            <div className={`mt-12 pt-6 border-t-2 border-slate-100 flex ${isThermal ? 'flex-col items-center gap-6' : 'justify-between items-end'}`}>
                <div className={`${isThermal ? 'text-center' : ''}`}>
                    <div className="text-md font-bold text-indigo-900 mb-1">Thank you for your business!</div>
                    <div className="text-xs text-slate-500 italic">This is a system generated receipt and does not require a signature.</div>
                </div>

                <div className="text-center">
                    <div className="w-32 border-b border-slate-300 mx-auto mb-2"></div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-700">Authorized Signature</div>
                </div>
            </div>

            {/* Added a subtle watermark for professional look */}
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] z-0 overflow-hidden">
                <h1 className="text-[150px] font-black transform -rotate-45 text-slate-900 tracking-tighter whitespace-nowrap">PAID</h1>
            </div>
        </div>
    );
});

UniversalReceipt.displayName = 'UniversalReceipt';

export default UniversalReceipt;
