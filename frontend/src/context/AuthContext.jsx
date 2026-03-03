import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const token = sessionStorage.getItem('token');
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
                        sessionStorage.setItem('user', JSON.stringify(data.user)); // Update user info just in case
                    } else {
                        // Token invalid or expired
                        sessionStorage.removeItem('user');
                        sessionStorage.removeItem('token');
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Failed to verify token', error);
                    // Decide if you want to log them out or keep the local storage user on network error
                    const storedUser = sessionStorage.getItem('user');
                    if (storedUser) setUser(JSON.parse(storedUser));
                }
            }
            setLoading(false);
        };
        verifyUser();
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('token', token);
    };

    const logout = async () => {
        const token = sessionStorage.getItem('token');
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
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
