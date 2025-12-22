'use client';

import React, { useState, useEffect } from 'react';
import { chatAPI } from '@/lib/api';
import { Conversation } from '@/types';
import { History, Trash2, MessageSquare, ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await chatAPI.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Utiliser une confirmation plus accessible
    const confirmed = window.confirm('Voulez-vous vraiment supprimer cette conversation ? Cette action est irréversible.');
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await chatAPI.deleteConversation(id);
      setConversations(prev => prev.filter(conv => conv.id !== id));
      // Notification de succès
      const notification = document.createElement('div');
      notification.textContent = 'Conversation supprimée avec succès';
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.setAttribute('role', 'status');
      notification.setAttribute('aria-live', 'polite');
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error('Erreur suppression:', error);
      const errorNotification = document.createElement('div');
      errorNotification.textContent = 'Erreur lors de la suppression. Veuillez réessayer.';
      errorNotification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorNotification.setAttribute('role', 'alert');
      document.body.appendChild(errorNotification);
      setTimeout(() => errorNotification.remove(), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: fr,
      });
    } catch {
      return 'Date inconnue';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="btn btn-secondary text-sm">
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline">Retour</span>
                </button>
              </Link>
              <div className="flex items-center gap-2">
                <History className="text-uvci-purple" size={24} />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Historique des conversations
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-uvci-purple/30 border-t-uvci-purple rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement de l'historique...</p>
          </div>
        ) : conversations.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20" role="status" aria-live="polite">
            <div className="text-6xl mb-6" role="img" aria-label="Aucune conversation">💬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Aucune conversation
            </h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Vous n'avez pas encore de conversations enregistrées. Commencez à discuter avec l'assistant UVCI !
            </p>
            <Link href="/">
              <button className="btn btn-primary focus:outline-none focus:ring-2 focus:ring-uvci-purple focus:ring-offset-2">
                <MessageSquare size={18} aria-hidden="true" />
                Nouvelle conversation
              </button>
            </Link>
          </div>
        ) : (
          /* Conversations List */
          <div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {conversations.length} conversation{conversations.length > 1 ? 's' : ''} trouvée{conversations.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-4">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all border border-gray-100 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Icon + Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-uvci-purple to-uvci-purpleLight flex items-center justify-center flex-shrink-0 shadow-md">
                        <MessageSquare className="text-white" size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-uvci-purple transition-colors">
                          {conv.title || 'Sans titre'}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {conv.message_count} message{conv.message_count > 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(conv.updated_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(conv.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/?conversation_id=${conv.id}`}>
                        <button
                          className="btn btn-secondary text-sm focus:outline-none focus:ring-2 focus:ring-uvci-purple focus:ring-offset-2"
                          title="Ouvrir cette conversation"
                          aria-label={`Ouvrir la conversation: ${conv.title || 'Sans titre'}`}
                        >
                          <MessageSquare size={16} aria-hidden="true" />
                          <span className="hidden sm:inline">Ouvrir</span>
                        </button>
                      </Link>

                      <button
                        onClick={() => handleDelete(conv.id)}
                        disabled={deletingId === conv.id}
                        aria-label={`Supprimer la conversation: ${conv.title || 'Sans titre'}`}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                        title="Supprimer"
                      >
                        {deletingId === conv.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" aria-hidden="true"></div>
                            <span className="sr-only">Suppression en cours...</span>
                          </>
                        ) : (
                          <Trash2 size={18} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
