import React, { useState } from 'react';
import { User, MapPin, CreditCard, Building, Search, X } from 'lucide-react';

const CustomerDetailsPanel = ({ client, onClientSelect, clients = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // Client Filter Logic
    const filteredClients = Array.isArray(clients) ? clients.filter(c => {
        const sTerm = searchTerm.toLowerCase();
        const idStr = c.id ? c.id.toString() : '';
        const paddedId = idStr ? `cl-${idStr.padStart(3, '0')}` : '';
        const paddedIdAlt = idStr ? `cl${idStr.padStart(3, '0')}` : '';

        return (
            (c.name && c.name.toLowerCase().includes(sTerm)) ||
            (c.phone && c.phone.includes(searchTerm)) ||
            (idStr && idStr.includes(sTerm)) ||
            (paddedId && paddedId.includes(sTerm)) ||
            (paddedIdAlt && paddedIdAlt.includes(sTerm)) ||
            (c.client_id && c.client_id.toString().toLowerCase().includes(sTerm))
        );
    }) : [];

    const handleSelect = (c) => {
        onClientSelect(c);
        setSearchTerm(c.name);
        setShowResults(false);
        setSelectedIndex(-1);
    };

    const handleClear = () => {
        onClientSelect(null);
        setSearchTerm('');
        setSelectedIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!showResults || filteredClients.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (selectedIndex + 1) % filteredClients.length;
            setSelectedIndex(nextIndex);
            setTimeout(() => {
                document.getElementById('client-suggestion-' + nextIndex)?.scrollIntoView({ block: 'nearest' });
            }, 0);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const nextIndex = selectedIndex <= 0 ? filteredClients.length - 1 : selectedIndex - 1;
            setSelectedIndex(nextIndex);
            setTimeout(() => {
                document.getElementById('client-suggestion-' + nextIndex)?.scrollIntoView({ block: 'nearest' });
            }, 0);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < filteredClients.length) {
                handleSelect(filteredClients[selectedIndex]);
            } else if (filteredClients.length > 0) {
                handleSelect(filteredClients[0]);
            }
        }
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
                        placeholder="Search Name / Phone / ID (F2)"
                        className="w-full bg-transparent border-none text-white text-sm px-2 py-1.5 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowResults(true);
                            setSelectedIndex(-1);
                        }}
                        onFocus={() => setShowResults(true)}
                        onKeyDown={handleKeyDown}
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
                            filteredClients.map((c, index) => (
                                <div
                                    key={c.id}
                                    id={`client-suggestion-${index}`}
                                    className={`px-3 py-2 cursor-pointer text-sm text-gray-300 border-b border-gray-800 last:border-0 ${selectedIndex === index ? 'bg-yellow-600/40' : 'hover:bg-yellow-600/20'}`}
                                    onClick={() => handleSelect(c)}
                                >
                                    <span className="font-bold text-white">{c.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({c.phone} | ID: {c.id || c.client_id})</span>
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
