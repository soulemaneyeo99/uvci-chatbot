'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    ShieldCheck,
    School,
    LogOut,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { settingsAPI } from '@/lib/api';

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{ is_connected: boolean; username: string | null; message: string } | null>(null);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const data = await settingsAPI.getUVCIStatus();
            setStatus(data);
        } catch (error) {
            console.error('Erreur status', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setFeedback(null);

        try {
            const result = await settingsAPI.updateUVCICredentials(formData);
            setStatus(result);
            setFeedback({ type: 'success', message: result.message });
            setFormData({ username: '', password: '' }); // Clear sensitive data
        } catch (error: any) {
            setFeedback({
                type: 'error',
                message: error.response?.data?.detail || "Erreur de connexion. Vérifiez vos identifiants."
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Voulez-vous vraiment déconnecter votre compte UVCI ? Le robot ne pourra plus vérifier vos devoirs.")) return;

        setIsSaving(true);
        try {
            await settingsAPI.disconnectUVCI();
            await fetchStatus();
            setFeedback({ type: 'success', message: "Compte déconnecté avec succès." });
        } catch (error) {
            setFeedback({ type: 'error', message: "Erreur lors de la déconnexion." });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <button className="flex items-center gap-2 text-gray-500 hover:text-uvci-purple transition-colors">
                                    <ArrowLeft size={20} />
                                    <span className="font-medium">Retour au Chat</span>
                                </button>
                            </Link>
                            <div className="h-6 w-px bg-gray-200"></div>
                            <h1 className="text-xl font-bold text-gray-900">Paramètres</h1>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Hero Section */}
                        <div className="bg-gradient-to-r from-uvci-orange/10 to-uvci-purple/10 p-8 text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-4">
                                <School className="text-uvci-orange" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connecteur UVCI</h2>
                            <p className="text-gray-600 max-w-md mx-auto">
                                Reliez votre compte étudiant pour permettre à l'assistant de vérifier vos devoirs et notes automatiquement.
                            </p>
                        </div>

                        {/* Status Section */}
                        <div className="p-8 border-b border-gray-100">
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="animate-spin text-gray-300" size={24} />
                                </div>
                            ) : status?.is_connected ? (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-green-900">Compte Connecté</h3>
                                                <p className="text-sm text-green-700">Utilisateur : {status.username}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleDisconnect}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Déconnecter"
                                        >
                                            <LogOut size={20} />
                                        </button>
                                    </div>

                                    {/* Bouton de Sync Manuelle */}
                                    <button
                                        onClick={async () => {
                                            setIsSaving(true);
                                            try {
                                                const res = await settingsAPI.syncMoodle();
                                                setFeedback({
                                                    type: 'success',
                                                    message: `Synchronisation réussie ! ${res.count} devoirs trouvés.`
                                                });
                                            } catch (e) {
                                                setFeedback({ type: 'error', message: "Erreur de synchro Moodle." });
                                            } finally {
                                                setIsSaving(false);
                                            }
                                        }}
                                        disabled={isSaving}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-uvci-purple text-uvci-purple font-bold rounded-xl hover:bg-purple-50 transition-all disabled:opacity-50"
                                    >
                                        <School size={18} />
                                        {isSaving ? "Synchronisation..." : "Synchroniser maintenant"}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                                    <div className="bg-gray-200 p-2 rounded-lg text-gray-500">
                                        <LogOut size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-700">Non connecté</h3>
                                        <p className="text-sm text-gray-500">Connectez-vous ci-dessous pour activer les alertes.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Form Section */}
                        {!status?.is_connected && (
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">

                                {feedback && (
                                    <div className={`p-4 rounded-xl flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                        <span className="font-medium text-sm">{feedback.message}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email ou Identifiant UVCI
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uvci-purple focus:border-transparent transition-all"
                                            placeholder="exemple@uvci.edu.ci"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mot de passe UVCI
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uvci-purple focus:border-transparent transition-all"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                            <ShieldCheck size={12} />
                                            Vos identifiants sont chiffrés (AES-256) et stockés de manière sécurisée.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-uvci-purple text-white font-bold py-3.5 rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <Save size={20} />
                                    )}
                                    {isSaving ? 'Vérification...' : 'Connecter mon compte'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
