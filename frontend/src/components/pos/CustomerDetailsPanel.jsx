import React, { useState } from 'react';
import { User, MapPin, CreditCard, Building, Search, X } from 'lucide-react';

const CustomerDetailsPanel = ({ client, onClientSelect, clients = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);

    // Client Filter Logic
    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    const handleSelect = (c) => {
        onClientSelect(c);
        setSearchTerm(c.name);
        setShowResults(false);
    };

    const handleClear = () => {
        onClientSelect(null);
        setSearchTerm('');
    };

    return (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 h-full flex flex-col gap-2 relative">
            <div className="bg-yellow-600/20 text-yellow-500 text-xs font-bold uppercase px-2 py-1 rounded w-fit flex items-center gap-1">
                <User size={12} /> Customer Details
            </div>

            <div className="relative z-20">
                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md px-2 focus-within:border-yellow-500 transition-colors">
                    <Search size={14} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search Name / Phone (F2)"
                        className="w-full bg-transparent border-none text-white text-sm px-2 py-1.5 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                    />
                    {client && (
                        <button onClick={handleClear} className="text-gray-400 hover:text-white">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Dropdown Results */}
                {showResults && searchTerm && (
                    <div className="absolute top-full left-0 w-full bg-gray-900 border border-gray-700 rounded-md mt-1 max-h-48 overflow-y-auto shadow-xl z-50">
                        {filteredClients.length > 0 ? (
                            filteredClients.map(c => (
                                <div
                                    key={c.id}
                                    className="px-3 py-2 hover:bg-yellow-600/20 cursor-pointer text-sm text-gray-300 border-b border-gray-800 last:border-0"
                                    onClick={() => handleSelect(c)}
                                >
                                    <span className="font-bold text-white">{c.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({c.phone})</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-xs text-gray-500 text-center">No customer found based on search...</div>
                        )}
                    </div>
                )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm flex-1 mt-1">
                <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Name</span>
                    <div className="text-white font-medium truncate border-b border-gray-700 pb-1">{client?.name || '-'}</div>
                </div>

                <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Phone</span>
                    <div className="text-white font-mono border-b border-gray-700 pb-1">{client?.phone || '-'}</div>
                </div>

                <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Door/St</span>
                    <div className="text-gray-300 truncate border-b border-gray-700 pb-1">{client?.address?.split(',')[0] || '-'}</div>
                </div>

                <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">City</span>
                    <div className="text-gray-300 truncate border-b border-gray-700 pb-1">{client?.city || '-'}</div>
                </div>

                <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Category</span>
                    <div className="text-emerald-400 font-bold border-b border-gray-700 pb-1">{client?.type || 'Retail Invoice'}</div>
                </div>

                <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Outstanding</span>
                    <div className="text-red-400 font-mono font-bold border-b border-gray-700 pb-1">{(parseFloat(client?.outstanding || 0)).toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsPanel;
