import React, { useState } from 'react';
import { Truck } from 'lucide-react';

const ShippingDetailsPanel = ({ shipping, onChange }) => {
    return (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 h-full flex flex-col gap-2 relative">
            <div className="bg-yellow-600/20 text-yellow-500 text-xs font-bold uppercase px-2 py-1 rounded w-fit flex items-center gap-1">
                <Truck size={12} /> Shipping Details
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs flex-1 mt-2">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Name</label>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Address (Flat/St)</label>

                <input
                    type="text"
                    className="bg-gray-900 border-b border-gray-600 text-white text-sm px-1 py-1 outline-none focus:border-yellow-500 placeholder-gray-600"
                    placeholder="Name"
                    value={shipping.name || ''}
                    onChange={(e) => onChange({ ...shipping, name: e.target.value })}
                />

                <input
                    type="text"
                    className="bg-gray-900 border-b border-gray-600 text-white text-sm px-1 py-1 outline-none focus:border-yellow-500 placeholder-gray-600"
                    placeholder="Address"
                    value={shipping.address || ''}
                    onChange={(e) => onChange({ ...shipping, address: e.target.value })}
                />

                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-2">City/Place</label>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-2">Pin / Phone</label>

                <input
                    type="text"
                    className="bg-gray-900 border-b border-gray-600 text-white text-sm px-1 py-1 outline-none focus:border-yellow-500 placeholder-gray-600"
                    placeholder="City"
                    value={shipping.city || ''}
                    onChange={(e) => onChange({ ...shipping, city: e.target.value })}
                />

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Pin"
                        className="w-1/3 bg-gray-900 border-b border-gray-600 text-white text-sm px-1 py-1 outline-none focus:border-yellow-500 placeholder-gray-600"
                        value={shipping.pincode || ''}
                        onChange={(e) => onChange({ ...shipping, pincode: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Phone"
                        className="w-2/3 bg-gray-900 border-b border-gray-600 text-white text-sm px-1 py-1 outline-none focus:border-yellow-500 placeholder-gray-600"
                        value={shipping.phone || ''}
                        onChange={(e) => onChange({ ...shipping, phone: e.target.value })}
                    />
                </div>

                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-2 col-span-2">PO No / Ref</label>
                <input
                    type="text"
                    className="col-span-2 bg-gray-900 border-b border-gray-600 text-white text-sm px-1 py-1 outline-none focus:border-yellow-500 placeholder-gray-600"
                    placeholder="Reference No"
                    value={shipping.refNo || ''}
                    onChange={(e) => onChange({ ...shipping, refNo: e.target.value })}
                />
            </div>
        </div>
    );
};

export default ShippingDetailsPanel;
