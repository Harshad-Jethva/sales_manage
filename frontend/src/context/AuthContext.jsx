import React, { createContext, useState, useEffect, useContext } from 'react';
import { buildApiUrl } from '../config/api';
import { getContextKeys } from '../utils/authStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const keys = getContextKeys();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => sessionStorage.getItem(keys.token));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const storedToken = sessionStorage.getItem(keys.token);
            const storedUserRaw = sessionStorage.getItem(keys.user);

            if (!storedToken) {
                if (storedUserRaw) {
                    sessionStorage.removeItem(keys.user);
                }
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(buildApiUrl('verify_auth.php'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedToken}`,
                    },
                    body: JSON.stringify({ token: storedToken }),
                });

                const data = await response.json();
                if (data?.success && data?.user) {
                    setUser(data.user);
                    setToken(storedToken);
                    sessionStorage.setItem(keys.user, JSON.stringify(data.user));
                } else {
                    sessionStorage.removeItem(keys.user);
                    sessionStorage.removeItem(keys.token);
                    setUser(null);
                    setToken(null);
                }
            } catch {
                // Fallback to cached user during temporary network/server issues.
                if (storedUserRaw) {
                    try {
                        setUser(JSON.parse(storedUserRaw));
                        setToken(storedToken);
                    } catch (parseError) {
                        console.error('Stored user parsing failed', parseError);
                        sessionStorage.removeItem(keys.user);
                        sessionStorage.removeItem(keys.token);
                        setUser(null);
                        setToken(null);
                    }
                } else {
                    setUser(null);
                    setToken(null);
                }
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, [keys.token, keys.user]);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        sessionStorage.setItem(keys.user, JSON.stringify(userData));
        sessionStorage.setItem(keys.token, authToken);
    };

    const logout = async () => {
        const currentToken = sessionStorage.getItem(keys.token);
        if (currentToken) {
            try {
                await fetch(buildApiUrl('logout.php'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${currentToken}`,
                    },
                    body: JSON.stringify({ token: currentToken }),
                });
            } catch (error) {
                console.error('Logout API error:', error);
            }
        }

        setUser(null);
        setToken(null);
        sessionStorage.removeItem(keys.user);
        sessionStorage.removeItem(keys.token);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, token }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
