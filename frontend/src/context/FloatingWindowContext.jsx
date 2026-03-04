import React, { createContext, useContext, useState } from 'react';

const FloatingWindowContext = createContext();

export const FloatingWindowProvider = ({ children }) => {
    const [windows, setWindows] = useState([]);

    const openWindow = (config) => {
        // config { id, title, url, icon, width, height }
        const id = config.id || Math.random().toString(36).substr(2, 9);

        setWindows(prev => {
            // If window already open, focus it (bring to front)
            const existing = prev.find(w => w.id === id);
            if (existing) {
                return [...prev.filter(w => w.id !== id), { ...existing, zIndex: Math.max(...prev.map(w => w.zIndex || 0), 0) + 1 }];
            }

            return [...prev, {
                ...config,
                id,
                zIndex: Math.max(...prev.map(w => w.zIndex || 0), 0) + 1,
                minimized: false
            }];
        });
    };

    const closeWindow = (id) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    };

    const focusWindow = (id) => {
        setWindows(prev => {
            const win = prev.find(w => w.id === id);
            if (!win) return prev;
            const maxZ = Math.max(...prev.map(w => w.zIndex || 0), 0);
            if (win.zIndex === maxZ && maxZ > 0) return prev;

            return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
        });
    };

    const toggleMinimize = (id) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w));
    };

    return (
        <FloatingWindowContext.Provider value={{ windows, openWindow, closeWindow, focusWindow, toggleMinimize }}>
            {children}
        </FloatingWindowContext.Provider>
    );
};

export const useFloatingWindows = () => useContext(FloatingWindowContext);
