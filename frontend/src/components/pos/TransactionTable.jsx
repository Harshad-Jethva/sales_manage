import React, { useState, useRef, useEffect } from 'react';
import { Trash2, PlusCircle, Search } from 'lucide-react';

const TransactionTable = ({ cart, onUpdateQty, onRemove, products, onAddItem }) => {
    const [newItemCode, setNewItemCode] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const nameInputRef = useRef(null);
    const codeInputRef = useRef(null);

    // Filter for suggestions
    const filteredSuggestions = products.filter(p => {
        if (!newItemName) return true;
        const term = newItemName.toLowerCase();
        return (p.name && p.name.toLowerCase().includes(term)) || (p.sku && p.sku.toLowerCase().includes(term));
    }).slice(0, 200);

    const handleCodeSubmit = (e) => {
        if (e.key === 'Enter') {
            const term = newItemCode.trim().toLowerCase();
            if (!term) return;

            const exactMatch = products.find(p =>
                (p.sku && p.sku.toLowerCase() === term) ||
                (p.barcode && p.barcode.toLowerCase() === term)
            );

            if (exactMatch) {
                onAddItem(exactMatch);
                setNewItemCode('');
                setNewItemName('');
            } else {
                // Focus name if code not found? Or just alert?
                // For now, let's keep focus or maybe jump to name
                nameInputRef.current?.focus();
            }
        }
    };

    const handleNameSubmit = (e) => {
        if (e.key === 'Enter') {
            if (filteredSuggestions.length > 0) {
                onAddItem(filteredSuggestions[0]);
                setNewItemName('');
                setNewItemCode('');
                setShowSuggestions(false);
                codeInputRef.current?.focus();
            }
        }
    };

    const selectSuggestion = (product) => {
        onAddItem(product);
        setNewItemName('');
        setNewItemCode('');
        setShowSuggestions(false);
        codeInputRef.current?.focus();
    };

    // Auto-focus code input on mount
    useEffect(() => {
        codeInputRef.current?.focus();
    }, []);

    return (
        <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex shadow-inner relative">
            {/* Main Table Area */}
            <div className={`flex flex-col transition-all duration-300 ${showSuggestions ? 'w-2/3 border-r border-gray-700' : 'w-full'}`}>
                {/* Table Header */}
                <div className="bg-yellow-600/20 border-b border-yellow-600/30 flex text-xs font-bold text-yellow-500 uppercase tracking-wider sticky top-0 z-10">
                    <div className="w-12 p-2 border-r border-gray-700 text-center">#</div>
                    <div className="w-32 p-2 border-r border-gray-700">Code (F3)</div>
                    <div className="flex-1 p-2 border-r border-gray-700">Item Name</div>
                    <div className="w-24 p-2 border-r border-gray-700 text-right">MRP</div>
                    <div className="w-24 p-2 border-r border-gray-700 text-right">Rate</div>
                    <div className="w-20 p-2 border-r border-gray-700 text-center">Qty</div>
                    <div className="w-20 p-2 border-r border-gray-700 text-center">Dis%</div>
                    <div className="w-32 p-2 border-r border-gray-700 text-right">Amount</div>
                    <div className="w-12 p-2 text-center">Act</div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 bg-gray-900 border-x border-b border-gray-700 relative">
                    {cart.map((item, index) => (
                        <div key={item.id} className="flex text-sm text-gray-300 border-b border-gray-700 hover:bg-yellow-900/10 transition-colors group relative">
                            <div className="w-12 p-2 border-r border-gray-700 text-center font-mono text-gray-500">{index + 1}</div>
                            <div className="w-32 p-2 border-r border-gray-700 font-mono text-xs truncate" title={item.sku}>{item.sku || 'N/A'}</div>
                            <div className="flex-1 p-2 border-r border-gray-700 font-medium text-white truncate" title={item.name}>{item.name}</div>
                            <div className="w-24 p-2 border-r border-gray-700 text-right font-mono text-gray-400">{item.mrp?.toFixed(2)}</div>
                            <div className="w-24 p-2 border-r border-gray-700 text-right font-mono text-white">{item.price.toFixed(2)}</div>

                            {/* Qty Input */}
                            <div className="w-20 p-1 border-r border-gray-700">
                                <input
                                    type="number"
                                    className="w-full h-full bg-gray-800 border border-gray-600 rounded text-center text-white outline-none focus:border-yellow-500 font-mono focus:bg-gray-700 transition-colors"
                                    value={item.qty}
                                    onChange={(e) => onUpdateQty(item.id, parseFloat(e.target.value) || 0)}
                                    min="1"
                                />
                            </div>

                            {/* Disc Input */}
                            <div className="w-20 p-1 border-r border-gray-700">
                                <input
                                    type="number"
                                    className="w-full h-full bg-gray-800 border border-gray-600 rounded text-center text-gray-300 outline-none focus:border-yellow-500 font-mono focus:bg-gray-700 transition-colors"
                                    value={item.discountPercent || 0}
                                    onChange={(e) => onUpdateQty(item.id, item.qty, parseFloat(e.target.value) || 0)}
                                />
                            </div>

                            <div className="w-32 p-2 border-r border-gray-700 text-right font-mono font-bold text-emerald-400">
                                {((item.price * item.qty) * (1 - (item.discountPercent || 0) / 100)).toFixed(2)}
                            </div>

                            <div className="w-12 p-1 flex items-center justify-center">
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-900/20 opacity-60 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* --- INLINE ADD ROW --- */}
                    <div className="flex h-10 border-b border-gray-700 bg-gray-800/50 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                        <div className="w-12 border-r border-gray-700 flex items-center justify-center text-yellow-500">
                            <PlusCircle size={16} />
                        </div>

                        {/* Code Input */}
                        <div className="w-32 border-r border-gray-700 p-1">
                            <input
                                ref={codeInputRef}
                                type="text"
                                placeholder="Scan / Code"
                                className="w-full h-full bg-gray-900 border border-gray-600 rounded px-2 text-xs text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none placeholder-gray-600 font-mono"
                                value={newItemCode}
                                onChange={(e) => setNewItemCode(e.target.value)}
                                onKeyDown={handleCodeSubmit}
                            />
                        </div>

                        {/* Name Input with Suggestions */}
                        <div className="flex-1 border-r border-gray-700 p-1 relative">
                            <input
                                ref={nameInputRef}
                                type="text"
                                placeholder="Search Item Name..."
                                className="w-full h-full bg-gray-900 border border-gray-600 rounded px-2 text-xs text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none placeholder-gray-600"
                                value={newItemName}
                                onChange={(e) => {
                                    setNewItemName(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onKeyDown={handleNameSubmit}
                                onFocus={() => setShowSuggestions(true)}
                            />
                            {/* Suggestions Dropdown Removed from here, moved to Right Panel */}
                        </div>

                        {/* Empty placeholders for alignment */}
                        <div className="w-24 border-r border-gray-700 bg-gray-900/30"></div>
                        <div className="w-24 border-r border-gray-700 bg-gray-900/30"></div>
                        <div className="w-20 border-r border-gray-700 bg-gray-900/30"></div>
                        <div className="w-20 border-r border-gray-700 bg-gray-900/30"></div>
                        <div className="w-32 border-r border-gray-700 bg-gray-900/30"></div>
                        <div className="w-12 bg-gray-900/30"></div>
                    </div>

                    {/* Empty row fillers */}
                    {cart.length === 0 && Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex h-8 border-b border-gray-800 bg-gray-900/20">
                            <div className="w-12 border-r border-gray-800"></div>
                            <div className="w-32 border-r border-gray-800"></div>
                            <div className="flex-1 border-r border-gray-800"></div>
                            <div className="w-24 border-r border-gray-800"></div>
                            <div className="w-24 border-r border-gray-800"></div>
                            <div className="w-20 border-r border-gray-800"></div>
                            <div className="w-20 border-r border-gray-800"></div>
                            <div className="w-32 border-r border-gray-800"></div>
                            <div className="w-12"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side Products Panel (Visible only when searching) */}
            {showSuggestions && (
                <div className="w-1/3 bg-gray-100 flex flex-col border-l border-gray-700">
                    <div className="bg-blue-300 border-b border-blue-400 text-blue-900 px-3 py-1 font-bold text-sm flex justify-between items-center shadow-sm">
                        <span>Products List</span>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-normal">Records : {filteredSuggestions.length}/{products.length}</span>
                            <button onClick={() => setShowSuggestions(false)} className="text-red-700 hover:text-white bg-red-300 hover:bg-red-500 rounded px-2 w-6 h-6 flex items-center justify-center transition-colors">✕</button>
                        </div>
                    </div>
                    <div className="p-1 bg-yellow-100/50 border-b border-yellow-200">
                        <input
                            type="text"
                            className="w-full text-xs p-1 outline-none border focus:border-blue-400 font-mono shadow-inner text-gray-800"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Type to search..."
                            autoFocus
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto bg-white border-l border-gray-300">
                        {/* Header for List */}
                        <div className="flex text-[11px] font-bold bg-yellow-500/80 text-black border-b border-gray-400 sticky top-0">
                            <div className="col-span-1 w-8 px-1 text-center border-r border-gray-400">Sno</div>
                            <div className="flex-1 px-2 border-r border-gray-400">Name</div>
                            <div className="w-20 px-2 border-r border-gray-400">Code</div>
                            <div className="w-20 px-2 text-right">Stock</div>
                        </div>
                        {filteredSuggestions.length > 0 ? (
                            filteredSuggestions.map((p, idx) => (
                                <div
                                    key={p.id}
                                    className={`flex text-xs font-mono cursor-pointer border-b border-gray-200 hover:bg-blue-600 hover:text-white ${idx === 0 ? 'bg-red-900 text-white font-bold' : 'text-gray-800 bg-gray-50'}`}
                                    onClick={() => selectSuggestion(p)}
                                >
                                    <div className="w-8 border-r border-gray-300 px-1 text-center bg-gray-200/50">{idx + 1}</div>
                                    <div className="flex-1 px-2 truncate" title={p.name}>{p.name}</div>
                                    <div className="w-20 border-l border-gray-300 px-2 truncate">{p.sku || p.id}</div>
                                    <div className="w-20 border-l border-gray-300 px-2 text-right">{p.stock_quantity || '0.00'}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-4 text-xs text-gray-500 font-mono">No Items Matching "{newItemName}"</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionTable;
