import React from 'react';

const InvoiceTemplate = ({ bill }) => {
    if (!bill) return null;

    return (
        <div id="invoice-print" className="p-8 hidden print:block bg-white text-black font-sans max-w-[80mm] mx-auto">
            <div className="text-center mb-4 border-b pb-2 border-dashed border-gray-400">
                <h1 className="text-xl font-bold uppercase tracking-wide">Sales Pro</h1>
                <p className="text-xs text-gray-600">123 Business Street, Tech City</p>
                <p className="text-xs text-gray-600">Phone: +91 98765 43210</p>
                <p className="text-xs text-gray-600">GSTIN: 24ABCDE1234F1Z5</p>
            </div>

            <div className="mb-4 text-xs flex justify-between">
                <div>
                    <p><strong>Bill No:</strong> {bill.billNo}</p>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                    <p><strong>Cashier:</strong> {bill.cashier}</p>
                </div>
            </div>

            {bill.client && (
                <div className="mb-4 text-xs border-b pb-2 border-dashed border-gray-400">
                    <p><strong>Customer:</strong> {bill.client.name}</p>
                    {bill.client.phone && <p>Phone: {bill.client.phone}</p>}
                </div>
            )}

            <table className="w-full text-xs text-left mb-4">
                <thead>
                    <tr className="border-b border-black">
                        <th className="py-1">Item</th>
                        <th className="py-1 text-center">Qty</th>
                        <th className="py-1 text-right">Price</th>
                        <th className="py-1 text-right">Amt</th>
                    </tr>
                </thead>
                <tbody>
                    {bill.cart.map((item, index) => (
                        <tr key={index} className="border-b border-dashed border-gray-300">
                            <td className="py-1 max-w-[100px] truncate">{item.name}</td>
                            <td className="py-1 text-center">{item.qty}</td>
                            <td className="py-1 text-right">{parseFloat(item.price).toFixed(2)}</td>
                            <td className="py-1 text-right">{(item.qty * item.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex flex-col gap-1 text-xs border-t border-black pt-2 mb-4">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{bill.subTotal?.toFixed(2) || '0.00'}</span>
                </div>
                {bill.discountAmount > 0 && (
                    <div className="flex justify-between">
                        <span>Discount</span>
                        <span>-{bill.discountAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>CGST/SGST</span>
                    <span>{bill.taxTotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-dashed border-gray-400">
                    <span>Grand Total</span>
                    <span>{bill.finalTotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                    <span>Paid ({bill.paymentMethod || '-'})</span>
                    <span>{bill.paidAmount?.toFixed(2) || '0.00'}</span>
                </div>
            </div>

            <div className="text-center text-[10px] mt-6 border-t pt-2 border-dashed border-gray-400">
                <p>Thank you for shopping with us!</p>
                <p>Visit Again</p>
                <p className="mt-2 text-[8px] text-gray-500">Powered by SalesPro</p>
            </div>

            <style>{`
        @media print {
          @page { margin: 0; size: 80mm auto; }
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; left: 0; top: 0; width: 100%; min-height: 100vh; background: white; color: black; }
        }
      `}</style>
        </div>
    );
};

export default InvoiceTemplate;
