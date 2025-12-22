'use client';

import React, { useState } from 'react';
import { Message } from '@/types';
import { Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { speechService } from '@/lib/speech';
import { formatRelativeTime } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleSpeak = () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      try {
        const support = speechService.isSupported();
        if (!support.synthesis) {
          // Utiliser une notification plus accessible qu'alert
          const notification = document.createElement('div');
          notification.textContent = 'La synthèse vocale n\'est pas supportée par votre navigateur';
          notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
          notification.setAttribute('role', 'alert');
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
          return;
        }
        
        speechService.speak(message.content);
        setIsSpeaking(true);
        
        // Reset après 10 secondes (durée approximative)
        setTimeout(() => setIsSpeaking(false), 10000);
      } catch (error) {
        console.error('Erreur lors de la synthèse vocale:', error);
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      // Fallback pour les navigateurs qui ne supportent pas l'API Clipboard
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Erreur lors de la copie (fallback):', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-enter`}>
      <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-assistant'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-uvci-blue flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
            <span className="text-xs text-gray-500">Assistant UVCI</span>
          </div>
        )}
        
        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <p className="text-white m-0">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="m-0 text-gray-800">{children}</p>,
                ul: ({ children }) => <ul className="ml-4 mt-2">{children}</ul>,
                ol: ({ children }) => <ol className="ml-4 mt-2">{children}</ol>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-medium mb-1">📚 Sources:</p>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((source, idx) => (
                <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50">
          <span className="text-xs text-gray-500">
            {formatRelativeTime(message.timestamp)}
          </span>
          
          {!isUser && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeak}
                aria-label={isSpeaking ? 'Arrêter la lecture vocale' : 'Lire le message à haute voix'}
                aria-pressed={isSpeaking}
                className="text-gray-500 hover:text-uvci-blue transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-uvci-blue focus:ring-offset-1 rounded"
                title={isSpeaking ? 'Arrêter la lecture' : 'Lire à voix haute'}
              >
                {isSpeaking ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
              </button>
              
              <button
                onClick={handleCopy}
                aria-label={isCopied ? 'Copié' : 'Copier le message'}
                className="text-gray-500 hover:text-uvci-blue transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-uvci-blue focus:ring-offset-1 rounded"
                title={isCopied ? 'Copié' : 'Copier'}
              >
                {isCopied ? (
                  <>
                    <Check size={14} className="text-green-500" aria-hidden="true" />
                    <span className="sr-only">Message copié</span>
                  </>
                ) : (
                  <Copy size={14} aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};