'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    email: string;
    full_name?: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: any, redirectPath?: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = await authAPI.me();
                setUser(userData);
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setIsLoading(false);
    };

    const login = async (credentials: any, redirectPath?: string) => {
        const { access_token, user } = await authAPI.login(credentials);
        localStorage.setItem('token', access_token);
        setUser(user);

        // Redirection basée sur le paramètre ou le rôle
        if (redirectPath) {
            router.push(redirectPath);
        } else if (user.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/dashboard');
        }
    };

    const register = async (userData: any) => {
        await authAPI.register(userData);
        // Auto login après register
        await login({ email: userData.email, password: userData.password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                isAdmin: user?.role === 'admin'
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
