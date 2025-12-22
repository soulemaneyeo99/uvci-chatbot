'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        
        if (!email.trim()) {
            setError('Veuillez entrer votre adresse email.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await authAPI.forgotPassword(email);
            if (result) {
                setSuccess(true);
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.');
            }
        } catch (err: any) {
            console.error('Erreur réinitialisation mot de passe:', err);
            // Gérer différents types d'erreurs
            if (err?.response) {
                // Erreur avec réponse du serveur
                setError(err.response.data?.detail || err.response.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
            } else if (err?.request) {
                // Requête envoyée mais pas de réponse
                setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
            } else {
                // Autre erreur
                setError(err?.message || 'Une erreur est survenue. Veuillez réessayer.');
            }
        } finally {
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
                        <div className="w-16 h-16 bg-gradient-to-br from-uvci-orange to-amber-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <Mail className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Mot de passe oublié</h1>
                        <p className="text-purple-100 text-center text-sm">
                            Entrez votre adresse email pour recevoir un lien de réinitialisation
                        </p>
                    </div>

                    {success ? (
                        <div className="space-y-6">
                            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6 text-center">
                                <CheckCircle className="text-green-400 mx-auto mb-3" size={48} />
                                <h2 className="text-xl font-bold text-white mb-2">Email envoyé !</h2>
                                <p className="text-green-100 text-sm mb-4">
                                    Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.
                                </p>
                                <p className="text-purple-200 text-xs">
                                    Vérifiez votre boîte de réception (et les spams). Le lien est valide pendant 30 minutes.
                                </p>
                            </div>
                            <Link href="/login">
                                <button className="w-full bg-gradient-to-r from-uvci-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-uvci-green focus:ring-offset-2 focus:ring-offset-transparent">
                                    <ArrowLeft size={20} />
                                    Retour à la connexion
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
                                <label className="text-sm font-medium text-purple-100 ml-1">Email académique</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="etudiant@uvci.edu.ci"
                                        aria-label="Adresse email académique"
                                        aria-required="true"
                                        autoComplete="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-uvci-orange/50 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                aria-label="Envoyer le lien de réinitialisation"
                                aria-busy={isSubmitting}
                                className="w-full bg-gradient-to-r from-uvci-orange to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-uvci-orange focus:ring-offset-2 focus:ring-offset-transparent"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Envoi en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        Envoyer le lien
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

