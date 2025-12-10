import React from 'react';
import { GraduationCap, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export const ChatHeader: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-uvci-green blur-lg opacity-20 rounded-full"></div>
                        <div className="relative bg-gradient-to-br from-uvci-purple to-uvci-purpleLight p-2 rounded-xl shadow-lg">
                            <GraduationCap className="text-white" size={20} />
                        </div>
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-tight">Assistant UVCI</h1>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                            {user?.full_name ? `Bonjour, ${user.full_name.split(' ')[0]}` : 'Étudiant'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {user?.role === 'admin' && (
                        <Link href="/admin">
                            <button className="p-2 text-gray-500 hover:text-uvci-purple hover:bg-purple-50 rounded-xl transition-colors">
                                <Settings size={20} />
                            </button>
                        </Link>
                    )}
                    <button
                        onClick={logout}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Se déconnecter"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};
