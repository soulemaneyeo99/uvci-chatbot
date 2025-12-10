'use client';

import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { speechService } from '@/lib/speech';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      const support = speechService.isSupported();
      if (!support.recognition) {
        alert('La reconnaissance vocale n\'est pas supportée par votre navigateur');
        return;
      }

      setIsListening(true);
      speechService.startListening(
        (transcript) => {
          setMessage(prev => prev + ' ' + transcript);
          setIsListening(false);
        },
        (error) => {
          console.error('Erreur reconnaissance vocale:', error);
          setIsListening(false);
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 bg-white border-t border-gray-200">
      <button
        type="button"
        onClick={toggleVoiceInput}
        disabled={isLoading}
        className={`p-3 rounded-lg transition-all duration-200 ${
          isListening
            ? 'bg-red-500 text-white recording-pulse'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        title={isListening ? 'Arrêter l\'enregistrement' : 'Enregistrement vocal'}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Posez votre question sur l'UVCI..."
        disabled={isLoading}
        rows={1}
        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-uvci-blue focus:ring-2 focus:ring-uvci-blue/20 outline-none resize-none transition-all duration-200 disabled:bg-gray-50"
        style={{ minHeight: '52px', maxHeight: '150px' }}
      />

      <Button
        type="submit"
        disabled={!message.trim() || isLoading}
        isLoading={isLoading}
        className="p-3 h-[52px] w-[52px] flex items-center justify-center"
      >
        {!isLoading && <Send size={20} />}
      </Button>
    </form>
  );
};