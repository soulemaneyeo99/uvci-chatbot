'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [role, setRole] = useState('student');
    const { register, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setIsSubmitting(true);
        try {
            await register({ full_name: fullName, email, password, role });
        } catch (err: any) {
            setError('Échec de l\'inscription. Cet email est peut-être déjà utilisé.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-uvci-purple px-4 py-8">
            {/* Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-uvci-orange opacity-20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-uvci-green opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-uvci-orange to-amber-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <GraduationCap className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Créer un compte</h1>
                        <p className="text-purple-100 text-center text-sm">Rejoignez la communauté UVCI</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${role === 'student'
                                        ? 'bg-uvci-orange/20 border-uvci-orange text-white'
                                        : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10'
                                    }`}
                            >
                                <GraduationCap size={24} className="mb-1" />
                                <span className="text-sm font-medium">Étudiant</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${role === 'admin'
                                        ? 'bg-uvci-orange/20 border-uvci-orange text-white'
                                        : 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10'
                                    }`}
                            >
                                <Lock size={24} className="mb-1" />
                                <span className="text-sm font-medium">Enseignant / Admin</span>
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-center">
                                <p className="text-red-200 text-xs">{error}</p>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-purple-100 ml-1">Nom complet</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Koffi Jean"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-11 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-uvci-orange/50 focus:border-transparent transition-all sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-purple-100 ml-1">Email académique</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="etudiant@uvci.edu.ci"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-11 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-uvci-orange/50 focus:border-transparent transition-all sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-purple-100 ml-1">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-11 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-uvci-orange/50 focus:border-transparent transition-all sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-purple-100 ml-1">Confirmer</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-11 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-uvci-orange/50 focus:border-transparent transition-all sm:text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="w-full bg-gradient-to-r from-uvci-orange to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-bold py-3.5 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    S'inscrire
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-purple-200 text-sm">
                            Déjà inscrit ?{' '}
                            <Link href="/login" className="text-white font-semibold hover:underline decoration-uvci-orange decoration-2 underline-offset-4">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
