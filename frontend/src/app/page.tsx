'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { SuggestionCards } from '@/components/chat/SuggestionCards';
import { Message } from '@/types';
import { chatAPI, settingsAPI } from '@/lib/api';
import { speechService } from '@/lib/speech';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSupport, setAudioSupport] = useState({ recognition: false, synthesis: false });
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAudioSupport(speechService.isSupported());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingContent('');

    let accumulatedContent = '';

    try {
      await chatAPI.sendMessageStream(
        {
          message: text,
          conversation_id: conversationId,
        },
        (chunk) => {
          accumulatedContent += chunk;
          setStreamingContent(accumulatedContent);
        },
        (metadata) => {
          if (!conversationId) setConversationId(metadata.conversation_id);

          const assistantMessage: Message = {
            id: metadata.message_id,
            role: 'assistant',
            content: accumulatedContent,
            timestamp: new Date(metadata.timestamp),
            sources: [], // TODO: Ajouter sources du backend si dispo
          };

          setMessages(prev => [...prev, assistantMessage]);
          setStreamingContent('');
          setIsLoading(false);
          setError(null);

          // Auto speak if enabled (optional feature)
          // handleSpeak(accumulatedContent);
        },
        (errorMessage) => {
          console.error('Erreur:', errorMessage);
          setError(errorMessage);
          const errorMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `⚠️ ${errorMessage || 'Erreur de connexion au serveur. Veuillez réessayer.'}`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMsg]);
          setStreamingContent('');
          setIsLoading(false);
        }
      );
    } catch (error: any) {
      const errorMsg = error?.message || 'Une erreur inattendue s\'est produite.';
      setError(errorMsg);
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      try {
        setIsRecording(true);
        setError(null);
        speechService.startListening(
          (transcript) => {
            if (transcript.trim()) {
              handleSendMessage(transcript);
            }
            setIsRecording(false);
          },
          (error) => {
            setIsRecording(false);
            setError('Erreur lors de la reconnaissance vocale. Veuillez réessayer.');
          }
        );
      } catch (error: any) {
        setIsRecording(false);
        setError('La reconnaissance vocale n\'est pas disponible sur votre navigateur.');
      }
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      speechService.speak(text);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 10000); // Timeout sécurité
    }
  };

  const handleSyncMoodle = async () => {
    if (isSyncing || !isAuthenticated) return;

    setIsSyncing(true);
    setError(null);

    try {
      const data = await settingsAPI.syncMoodle();

      const syncMessage: Message = {
        id: `sync-${Date.now()}`,
        role: 'assistant',
        content: `🔄 **Synchronisation Moodle terminée**\n\nJ'ai trouvé **${data.count}** événement(s) à venir sur votre plateforme UVCI.\n\n${data.assignments.map((a: any) => `- **${a.title}**\n  📅 ${a.due_date}`).join('\n\n')}\n\n*Je vous enverrai un email dès qu'une nouvelle activité sera détectée !*`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, syncMessage]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Échec de la synchronisation Moodle.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50/50 overflow-hidden relative">
      {/* Sync Button UI - Floating Premium */}
      {isAuthenticated && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleSyncMoodle}
            disabled={isSyncing}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all duration-300
              ${isSyncing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-white text-uvci-purple hover:bg-uvci-purple hover:text-white border border-uvci-purple/20'
              }
            `}
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">Sync Moodle</span>
          </button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto" role="main" aria-live="polite" aria-atomic="false">
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm" role="alert">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl" aria-hidden="true">⚠️</span>
              <div className="flex-1">
                <p className="text-red-800 font-medium text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-red-600 hover:text-red-800 text-xs underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                  aria-label="Fermer le message d'erreur"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
        {messages.length === 0 && !streamingContent ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-uvci-green to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/20 mb-6 animate-bounce-slow" aria-hidden="true">
              <span className="text-4xl" role="img" aria-label="Salutation">👋</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Comment puis-je vous aider ?
            </h2>
            <p className="text-gray-500 text-center max-w-md px-6 mb-8">
              Je suis l'<span className="font-bold text-uvci-purple">Assistant UVCI</span>. Posez-moi vos questions sur les cours, les inscriptions ou la vie universitaire.
            </p>

            <SuggestionCards onSelect={handleSendMessage} />
          </div>
        ) : (
          <div className="py-6 px-4 pb-20" role="log" aria-label="Conversation">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isSpeaking={isSpeaking}
                onSpeak={handleSpeak}
              />
            ))}

            {streamingContent && (
              <ChatBubble
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingContent,
                  timestamp: new Date()
                }}
                isSpeaking={false}
                onSpeak={() => { }}
              />
            )}

            {isLoading && !streamingContent && (
              <div className="flex justify-start px-1 mb-6" role="status" aria-live="polite">
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-uvci-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }} aria-hidden="true"></div>
                  <div className="w-2 h-2 bg-uvci-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }} aria-hidden="true"></div>
                  <div className="w-2 h-2 bg-uvci-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }} aria-hidden="true"></div>
                  <span className="sr-only">L'assistant est en train de réfléchir...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </main>

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isRecording={isRecording}
        onToggleRecording={handleToggleRecording}
        recordSupported={audioSupport.recognition}
      />
    </div>
  );
}
