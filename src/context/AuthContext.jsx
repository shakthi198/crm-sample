import React, { createContext, useContext, useState } from 'react';
import apiEndpoints from '../apiconfig';

const BASE_URL = apiEndpoints.baseUrl;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Roles: 'Super Admin', 'Manager', 'Finance', 'Telecaller', 'Admin'
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('crm_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (email, password) => {
        try {
            const response = await fetch(apiEndpoints.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password: password })
            });
            const data = await response.json();

            if (data.success && data.token) {
                // Backend returns flat structure: { success, token, role, username, permissions }
                const newUser = {
                    name: data.username,
                    email: email,
                    role: data.role,
                    token: data.token,
                    permissions: data.permissions || []
                };
                setUser(newUser);
                localStorage.setItem('crm_user', JSON.stringify(newUser));
                localStorage.setItem('token',newUser.token);
                return true;
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('crm_user');
        localStorage.removeItem('token');
        setUser(null);
    };

    const switchRole = (newRole) => {
        // This might be debug only or specific feature
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        localStorage.setItem('crm_user', JSON.stringify(updatedUser));
        localStorage.setItem('token', updatedUser.token);
    };

    const hasPermission = (permission) => {
        if (!user) return false;

        // Admins have access to everything
        if (user.role === 'Super Admin' || user.role === 'Admin') return true;

        // Check if permission is a module name (e.g., 'Dashboard', 'Leads')
        const modulePerm = user.permissions?.find(p => p.module.toLowerCase() === permission.toLowerCase());
        if (modulePerm) {
            return parseInt(modulePerm.view) === 1 || parseInt(modulePerm.full_access) === 1;
        }

        // Specific action checks can be added here if needed
        switch (permission) {
            case 'approve_budget':
                return ['Manager', 'Finance'].includes(user.role);
            default:
                return false;
        }
    };

    const updateProfile = (updatedData) => {
        if (!user) return;
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('crm_user', JSON.stringify(newUser));
        localStorage.setItem('token', newUser.token);
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, switchRole, hasPermission, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
