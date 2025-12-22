'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Lock, ArrowLeft, ArrowRight, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/lib/api';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token de réinitialisation manquant. Veuillez utiliser le lien reçu par email.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!token) {
            setError('Token de réinitialisation manquant.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setIsSubmitting(true);
        try {
            await authAPI.resetPassword(token, newPassword, confirmPassword);
            setSuccess(true);
            // Rediriger vers la page de connexion après 3 secondes
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Une erreur est survenue. Le token est peut-être expiré.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 8) return { strength: 1, label: 'Faible', color: 'bg-red-500' };
        if (password.length < 12) return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
        if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) {
            return { strength: 3, label: 'Fort', color: 'bg-green-500' };
        }
        return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

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
                        <div className="w-16 h-16 bg-gradient-to-br from-uvci-green to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <Lock className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Nouveau mot de passe</h1>
                        <p className="text-purple-100 text-center text-sm">
                            Choisissez un nouveau mot de passe sécurisé
                        </p>
                    </div>

                    {success ? (
                        <div className="space-y-6">
                            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6 text-center">
                                <CheckCircle className="text-green-400 mx-auto mb-3" size={48} />
                                <h2 className="text-xl font-bold text-white mb-2">Mot de passe réinitialisé !</h2>
                                <p className="text-green-100 text-sm">
                                    Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion...
                                </p>
                            </div>
                            <Link href="/login">
                                <button className="w-full bg-gradient-to-r from-uvci-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-uvci-green focus:ring-offset-2 focus:ring-offset-transparent">
                                    <ArrowRight size={20} />
                                    Aller à la connexion
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center">
                                    <p className="text-red-200 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-purple-100 ml-1">Nouveau mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimum 8 caractères"
                                        aria-label="Nouveau mot de passe"
                                        aria-required="true"
                                        autoComplete="new-password"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 pr-12 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-uvci-green/50 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-uvci-green/50 rounded"
                                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {newPassword && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-all ${
                                                        level <= passwordStrength.strength
                                                            ? passwordStrength.color
                                                            : 'bg-gray-600'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs ${passwordStrength.strength === 3 ? 'text-green-300' : passwordStrength.strength === 2 ? 'text-yellow-300' : 'text-red-300'}`}>
                                            Force: {passwordStrength.label || 'Faible'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-purple-100 ml-1">Confirmer le mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={20} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Répétez le mot de passe"
                                        aria-label="Confirmer le mot de passe"
                                        aria-required="true"
                                        autoComplete="new-password"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 pr-12 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-uvci-green/50 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-uvci-green/50 rounded"
                                        aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-300">Les mots de passe ne correspondent pas</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !token || newPassword.length < 8 || newPassword !== confirmPassword}
                                aria-label="Réinitialiser le mot de passe"
                                aria-busy={isSubmitting}
                                className="w-full bg-gradient-to-r from-uvci-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-uvci-green focus:ring-offset-2 focus:ring-offset-transparent"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Réinitialisation...</span>
                                    </>
                                ) : (
                                    <>
                                        Réinitialiser
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <Link href="/login">
                            <button className="text-purple-200 text-sm hover:text-white hover:underline transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-uvci-green/50 rounded">
                                <ArrowLeft size={16} />
                                Retour à la connexion
                            </button>
                        </Link>
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-uvci-purple">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}

