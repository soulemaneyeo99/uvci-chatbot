'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { SuggestionCards } from '@/components/chat/SuggestionCards';
import { Message } from '@/types';
import { chatAPI } from '@/lib/api';
import { speechService } from '@/lib/speech';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSupport, setAudioSupport] = useState({ recognition: false, synthesis: false });
  const [streamingContent, setStreamingContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAudioSupport(speechService.isSupported());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

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

          // Auto speak if enabled (optional feature)
          // handleSpeak(accumulatedContent);
        },
        (error) => {
          console.error('Erreur:', error);
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '⚠️ Erreur de connexion au serveur.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
          setStreamingContent('');
          setIsLoading(false);
        }
      );
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechService.startListening(
        (transcript) => {
          handleSendMessage(transcript);
          setIsRecording(false);
        },
        () => setIsRecording(false)
      );
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

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-gray-50/50">
        <ChatHeader />

        <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto">
          {messages.length === 0 && !streamingContent ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-uvci-green to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/20 mb-6 animate-bounce-slow">
                <span className="text-4xl">👋</span>
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
            <div className="py-6 px-4 pb-20">
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
                <div className="flex justify-start px-1 mb-6">
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-uvci-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-uvci-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-uvci-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isRecording={isRecording}
          onToggleRecording={handleToggleRecording}
          recordSupported={audioSupport.recognition}
        />
      </div>
    </ProtectedRoute>
  );
}
