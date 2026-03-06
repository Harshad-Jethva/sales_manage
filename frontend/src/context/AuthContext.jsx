import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getKeys = () => {
        let prefix = '';
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            let contextId = urlParams.get('context_id');

            // If contextId is in URL, store it in window.name for persistence across navigations in this frame
            if (contextId) {
                window.name = `ctx_${contextId}`;
            } else if (window.name.startsWith('ctx_')) {
                // Retrieve from window.name if already set
                contextId = window.name.replace('ctx_', '');
            }

            if (contextId) {
                prefix = `${contextId}_`;
            } else if (window.self !== window.top) {
                prefix = 'iframe_';
            }
        }
        return {
            token: `${prefix}token`,
            user: `${prefix}user`
        };
    };

    const keys = getKeys();

    useEffect(() => {
        const verifyUser = async () => {
            const token = sessionStorage.getItem(keys.token);
            if (token) {
                try {
                    const response = await fetch('http://localhost/sales_manage/backend/api/verify_auth.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token })
                    });
                    const data = await response.json();

                    if (data.success) {
                        setUser(data.user);
                        sessionStorage.setItem(keys.user, JSON.stringify(data.user)); // Update user info just in case
                    } else {
                        // Token invalid or expired
                        sessionStorage.removeItem(keys.user);
                        sessionStorage.removeItem(keys.token);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Failed to verify token', error);
                    // Decide if you want to log them out or keep the local storage user on network error
                    const storedUser = sessionStorage.getItem(keys.user);
                    if (storedUser) setUser(JSON.parse(storedUser));
                }
            }
            setLoading(false);
        };
        verifyUser();
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        sessionStorage.setItem(keys.user, JSON.stringify(userData));
        sessionStorage.setItem(keys.token, token);
    };

    const logout = async () => {
        const token = sessionStorage.getItem(keys.token);
        if (token) {
            try {
                await fetch('http://localhost/sales_manage/backend/api/logout.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
            } catch (error) {
                console.error('Logout API error:', error);
            }
        }
        setUser(null);
        sessionStorage.removeItem(keys.user);
        sessionStorage.removeItem(keys.token);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, token: sessionStorage.getItem(keys.token) }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
