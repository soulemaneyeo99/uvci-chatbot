'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login({ email, password });
        } catch (err: any) {
            setError('Email ou mot de passe incorrect.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-uvci-purple via-purple-700 to-indigo-900 px-4 py-8">
            {/* Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-uvci-green opacity-20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-uvci-orange opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-uvci-green to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <GraduationCap className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Bienvenue</h1>
                        <p className="text-purple-100 text-center">Connectez-vous à votre espace UVCI</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center">
                                <p className="text-red-200 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-purple-100 ml-1">Email académique</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="etudiant@uvci.edu.ci"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-uvci-green/50 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-purple-100 ml-1">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-uvci-green/50 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="w-full bg-gradient-to-r from-uvci-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Se connecter
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-purple-200 text-sm">
                            Pas encore de compte ?{' '}
                            <Link href="/register" className="text-white font-semibold hover:underline decoration-uvci-green decoration-2 underline-offset-4">
                                S'inscrire
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-purple-300/60 text-xs">
                        © 2024 Université Virtuelle de Côte d'Ivoire
                    </p>
                </div>
            </div>
        </div>
    );
}
