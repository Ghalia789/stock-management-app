import React, { createContext, useState, useEffect } from 'react';

// Create AuthContext
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(localStorage.getItem('adminToken') || null);

    // Update localStorage when authToken changes
    useEffect(() => {
        console.log('authToken changed:', authToken); // Debug log
        if (authToken) {
            localStorage.setItem('adminToken', authToken);
            console.log('Token saved to localStorage'); // Debug log
        } else {
            localStorage.removeItem('adminToken');
            console.log('Token removed from localStorage'); // Debug log
        }
    }, [authToken]);

    const login = (token) => {
        setAuthToken(token); // Update state
    };

    const logout = () => {
        localStorage.removeItem('adminToken'); // Remove token from storage
        setAuthToken(null); // Clear state
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ authToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;