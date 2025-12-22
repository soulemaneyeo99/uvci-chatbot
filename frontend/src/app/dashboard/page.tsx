'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/lib/api';
import {
    Calendar as CalendarIcon,
    TrendingUp,
    Bell,
    BookOpen,
    CheckCircle2,
    Clock,
    AlertCircle,
    GraduationCap,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [s, a, c] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getAnnouncements(),
                dashboardAPI.getCalendar()
            ]);
            setStats(s);
            setAnnouncements(a);
            setEvents(c);
        } catch (error) {
            console.error("Erreur dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50 pb-12">
                {/* Header Premium */}
                <div className="bg-white border-b border-gray-100 pt-8 pb-16 px-4 mb-[-64px]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Vision 360 🎯</h1>
                                <p className="text-gray-500 mt-1">Bon retour, {user?.full_name || user?.email}</p>
                            </div>
                            <Link
                                href="/"
                                className="flex items-center gap-2 bg-uvci-purple text-white px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform"
                            >
                                <ArrowRight className="w-4 h-4" />
                                <span>Ouvrir le Chat IA</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4">
                    {/* Grid de Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Widget 1: Progression Académique */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 md:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-uvci-green" />
                                    Progression du Semestre
                                </h3>
                                <span className="text-2xl font-black text-uvci-purple">{stats?.overall_progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden mb-6">
                                <div
                                    className="bg-gradient-to-r from-uvci-purple to-emerald-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${stats?.overall_progress || 0}%` }}
                                ></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-xs text-gray-500 mb-1">Moyenne</p>
                                    <p className="text-xl font-bold text-gray-900">{stats?.average_grade || 0}/20</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-xs text-gray-500 mb-1">UE Validées</p>
                                    <p className="text-xl font-bold text-gray-900">{stats?.courses_completed || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-xs text-gray-500 mb-1">Crédits (ECTS)</p>
                                    <p className="text-xl font-bold text-gray-900">{stats?.credits_earned || 0}/{stats?.credits_total || 30}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-xs text-gray-500 mb-1">Statut</p>
                                    <p className="text-sm font-bold text-emerald-600">En cours</p>
                                </div>
                            </div>
                        </div>

                        {/* Widget 2: Prochains Devoirs (Mini Cal) */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-orange-500" />
                                    Calendrier
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {events.length > 0 ? events.slice(0, 5).map((ev: any, i: number) => (
                                    <div key={i} className={`flex gap-4 items-start p-3 hover:bg-gray-50 rounded-2xl transition-colors border-l-4 ${ev.type === 'assignment' ? 'border-uvci-purple' :
                                        ev.type === 'exam' ? 'border-red-500' :
                                            ev.type === 'holiday' ? 'border-green-500' : 'border-blue-500'
                                        }`}>
                                        <div className={`p-2 rounded-lg text-center min-w-[50px] ${ev.type === 'assignment' ? 'bg-purple-50 text-uvci-purple' :
                                            ev.type === 'exam' ? 'bg-red-50 text-red-600' :
                                                ev.type === 'holiday' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            <p className="text-[10px] font-bold uppercase">{new Date(ev.start).toLocaleString('fr-FR', { month: 'short' })}</p>
                                            <p className="text-lg font-black">{new Date(ev.start).getDate()}</p>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="text-sm font-bold text-gray-900 truncate">{ev.title}</h4>
                                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                                {ev.source} • {ev.type}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <Clock className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-xs">Aucun événement proche</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Widget 3: Annonces */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-red-500" />
                                    Dernières Annonces
                                </h3>
                            </div>
                            <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2">
                                {announcements.map((ann) => (
                                    <div key={ann.id} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${ann.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {ann.category}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{ann.date}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-uvci-purple transition-colors">
                                            {ann.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 line-clamp-2">{ann.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Widget 4: Quick Actions */}
                        <div className="bg-gradient-to-br from-uvci-purple to-[#4c1d95] rounded-3xl p-8 text-white shadow-xl shadow-purple-500/20 md:col-span-2 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2">Prêt pour un examen blanc ?</h3>
                                <p className="text-purple-100 mb-6 max-w-md">L'IA peut générer des tests personnalisés basés sur vos cours PDF pour vous préparer aux évaluations.</p>
                                <button disabled className="bg-white text-uvci-purple px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-gray-100 transition-colors opacity-80 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Générer un Test (Bientôt)
                                </button>
                            </div>
                            <BookOpen className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/10 rotate-12" />
                        </div>

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
