'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
    Menu, X, LogIn, UserPlus,
    Settings, LogOut, User as UserIcon,
    GraduationCap,
    LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-uvci-orange to-uvci-purple rounded-lg flex items-center justify-center text-white font-bold">
                                U
                            </div>
                            <span className="font-bold text-gray-900 text-lg hidden sm:block">
                                Assistant UVCI
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            // Connected State
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-uvci-purple/10 rounded-full flex items-center justify-center text-uvci-purple">
                                        <UserIcon size={18} />
                                    </div>
                                    <span className="font-medium text-sm text-gray-700">{user.full_name || 'Étudiant'}</span>
                                </button>

                                {/* Dropdown */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in slide-in-from-top-2">
                                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <LayoutDashboard size={16} />
                                            Vision 360
                                        </Link>
                                        <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <Settings size={16} />
                                            Paramètres
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                <GraduationCap size={16} />
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                        >
                                            <LogOut size={16} />
                                            Déconnexion
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Guest State
                            <div className="flex items-center gap-3">
                                <Link href="/login">
                                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-uvci-purple transition-colors">
                                        <LogIn size={18} />
                                        Connexion
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-uvci-purple text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-md shadow-purple-200">
                                        <UserPlus size={18} />
                                        S'inscrire
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3 px-2 py-3 bg-gray-50 rounded-lg mb-2">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-uvci-purple shadow-sm">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{user.full_name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 bg-gray-50 rounded-xl">
                                <LayoutDashboard size={20} />
                                Vision 360 (Dashboard)
                            </Link>
                            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-700 bg-gray-50 rounded-xl">
                                <Settings size={20} />
                                Paramètres & Moodle
                            </Link>
                            {user.role === 'admin' && (
                                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 bg-gray-50 rounded-xl">
                                    <GraduationCap size={20} />
                                    Administration
                                </Link>
                            )}
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 bg-red-50 rounded-xl"
                            >
                                <LogOut size={20} />
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <Link href="/login" className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium">
                                <LogIn size={20} />
                                Connexion Étudiant
                            </Link>
                            <Link href="/register" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-uvci-purple text-white rounded-xl font-medium shadow-md">
                                <UserPlus size={20} />
                                Nouvelle Inscription
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
