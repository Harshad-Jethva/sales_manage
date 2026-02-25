import React, { createContext, useContext, useState, useCallback } from 'react';

const CursorContext = createContext();

export const CursorProvider = ({ children }) => {
    const [cursorType, setCursorType] = useState('default');
    const [cursorContext, setCursorContext] = useState(null); // e.g., '+', 'edit', 'delete'
    const [isLoading, setIsLoading] = useState(false);

    const setType = useCallback((type) => {
        setCursorType(type);
    }, []);

    const setContext = useCallback((context) => {
        setCursorContext(context);
    }, []);

    const setLoading = useCallback((loading) => {
        setIsLoading(loading);
    }, []);

    const withLoading = useCallback(async (fn) => {
        setIsLoading(true);
        try {
            return await fn();
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <CursorContext.Provider
            value={{
                cursorType,
                setType,
                cursorContext,
                setContext,
                isLoading,
                setLoading,
                withLoading,
            }}
        >
            {children}
        </CursorContext.Provider>
    );
};

export const useCursor = () => {
    const context = useContext(CursorContext);
    if (!context) {
        throw new Error('useCursor must be used within a CursorProvider');
    }
    return context;
};
