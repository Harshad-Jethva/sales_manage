import React, { useMemo } from 'react';
import { CreditCard, Check } from 'lucide-react';

const FooterTotals = ({ totals, lastTendered, cartCount, onCheckout }) => {
    return (
        <div className="bg-gray-800/80 border-t border-gray-700/80 p-3 h-full flex flex-col justify-between">
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-700 pb-1">
                    <span>Session: <span className="text-white font-bold">1</span></span>
                    <span>Items: <span className="text-white font-bold">{cartCount}</span></span>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Gross</span>
                    <span className="text-white font-mono">{totals.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Item Offer (Disc)</span>
                    <span className="text-red-400 font-mono">-{totals.discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">VAT / Tax</span>
                    <span className="text-emerald-400 font-mono">+{totals.taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Rounding</span>
                    <span className="text-gray-500 font-mono">0.00</span>
                </div>
            </div>

            <div className="mt-4 bg-gray-900 border border-gray-600 rounded-lg p-3 text-center shadow-inner">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Net Totals</div>
                <div className="text-4xl font-bold text-white font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600 drop-shadow-sm">
                    {totals.finalTotal.toFixed(2)}
                </div>
            </div>

            <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center text-xs bg-gray-900 border border-gray-700 p-2 rounded">
                    <span className="text-gray-400 font-bold uppercase">Last Tendered</span>
                    <span className="text-white font-mono text-lg">{lastTendered ? lastTendered.toFixed(2) : '-'}</span>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={cartCount === 0}
                    className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-700 hover:from-yellow-500 hover:to-amber-600 text-white font-bold text-lg rounded-lg shadow-lg shadow-amber-900/50 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border border-amber-600/50"
                >
                    <CreditCard size={20} />
                    <span>PAY / F10</span>
                </button>
            </div>
        </div>
    );
};

export default FooterTotals;
