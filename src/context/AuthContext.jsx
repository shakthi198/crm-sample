import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Roles: 'Super Admin', 'Manager', 'Finance', 'Telecaller'
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('crm_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (email, password) => {
        // In a real app, validate credentials here.
        // For now, we simulate a successful login.
        const newUser = {
            name: email.split('@')[0] || 'Admin User',
            email: email,
            role: 'Super Admin',
            organizationId: 'ORG-123'
        };
        setUser(newUser);
        localStorage.setItem('crm_user', JSON.stringify(newUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('crm_user');
    };

    const switchRole = (newRole) => {
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        localStorage.setItem('crm_user', JSON.stringify(updatedUser));
    };

    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.role === 'Super Admin') return true;

        switch (permission) {
            case 'approve_budget':
                return ['Manager', 'Finance'].includes(user.role);
            case 'edit_budget':
                return ['Manager', 'Finance', 'Telecaller'].includes(user.role);
            case 'finalize_budget':
                return ['Finance'].includes(user.role);
            default:
                return false;
        }
    };

    const updateProfile = (updatedData) => {
        if (!user) return;
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('crm_user', JSON.stringify(newUser));
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, switchRole, hasPermission, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
