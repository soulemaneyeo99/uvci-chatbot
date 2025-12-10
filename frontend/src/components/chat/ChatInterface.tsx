'use client';

import React, { useState, useEffect } from 'react';
import { Message } from '@/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { chatAPI } from '@/lib/api';
import { MessageSquare, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (content: string) => {
    setError(null);
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Envoyer au backend
      const response = await chatAPI.sendMessage({
        message: content,
        conversation_id: conversationId,
      });

      // Mettre à jour l'ID de conversation
      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      // Ajouter la réponse de l'assistant
      const assistantMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(response.timestamp),
        sources: response.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
      
      // Message d'erreur
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(undefined);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-uvci-blue rounded-lg flex items-center justify-center">
                <MessageSquare className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chatbot UVCI</h1>
                <p className="text-sm text-gray-500">Assistant intelligent</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                title="Nouvelle conversation"
              >
                <MessageSquare size={18} className="mr-2" />
                Nouveau
              </Button>
              
              <Link href="/history">
                <Button variant="ghost" size="sm" title="Historique">
                  <History size={18} className="mr-2" />
                  Historique
                </Button>
              </Link>

              <Link href="/admin">
                <Button variant="ghost" size="sm" title="Administration">
                  <Settings size={18} className="mr-2" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden max-w-5xl w-full mx-auto">
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Input */}
      <div className="max-w-5xl w-full mx-auto">
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};