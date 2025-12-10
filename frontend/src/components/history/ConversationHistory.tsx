'use client';

import React, { useEffect, useState } from 'react';
import { Conversation } from '@/types';
import { historyAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { MessageSquare, Trash2, Calendar, MessageCircle } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

export const ConversationHistory: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await historyAPI.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Erreur chargement conversations:', err);
      setError('Impossible de charger l\'historique');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (conversationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      return;
    }

    try {
      await historyAPI.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return <Loading text="Chargement de l'historique..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadConversations}>Réessayer</Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Aucune conversation
        </h3>
        <p className="text-gray-500 mb-6">
          Commencez une nouvelle conversation pour voir l'historique
        </p>
        <Link href="/">
          <Button>Nouvelle conversation</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        📜 Historique des conversations
      </h2>

      <div className="grid gap-4">
        {conversations.map((conversation) => (
          <Card key={conversation.id} className="hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageCircle size={20} className="text-uvci-blue" />
                  {conversation.title}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatRelativeTime(conversation.updated_at)}
                  </span>
                  <span>
                    {conversation.message_count || 0} message(s)
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  Créé le {formatDate(conversation.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Link href={`/conversation/${conversation.id}`}>
                  <Button size="sm" variant="secondary">
                    Voir
                  </Button>
                </Link>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(conversation.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};