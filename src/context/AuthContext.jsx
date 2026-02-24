import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState({ uid: 'local-user', displayName: 'Student', email: 'student@local.app' });
    const [loading, setLoading] = useState(false);

    const signup = async (email, password) => {
        return Promise.resolve();
    };

    const login = (email, password) => {
        return Promise.resolve();
    };

    const logout = () => {
        return Promise.resolve();
    };

    const googleSignIn = async () => {
        return Promise.resolve();
    };

    const updateProfileInfo = async (name, photo) => {
        return Promise.resolve();
    };

    const value = {
        currentUser,
        login,
        signup,
        logout,
        googleSignIn,
        updateProfileInfo,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
