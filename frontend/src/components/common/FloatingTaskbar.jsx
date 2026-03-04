import React from 'react';
import { useFloatingWindows } from '../../context/FloatingWindowContext';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingTaskbar = () => {
    const { windows, focusWindow, toggleMinimize } = useFloatingWindows();

    if (windows.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[10000] pointer-events-auto">
            <AnimatePresence>
                {windows.map((win) => (
                    <motion.button
                        key={win.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => {
                            if (win.minimized) {
                                toggleMinimize(win.id);
                            }
                            focusWindow(win.id);
                        }}
                        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${!win.minimized
                                ? 'bg-indigo-500/20 border border-indigo-500/30 text-white'
                                : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-indigo-400">{win.icon}</span>
                            <span className="text-xs font-semibold whitespace-nowrap overflow-hidden max-w-[100px] transition-all">
                                {win.title.split(' - ')[0]}
                            </span>
                        </div>

                        {/* Active Indicator */}
                        {!win.minimized && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full"></div>
                        )}

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                            {win.title}
                        </div>
                    </motion.button>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default FloatingTaskbar;
