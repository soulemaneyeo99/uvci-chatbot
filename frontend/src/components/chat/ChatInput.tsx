import React, { useState } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    isRecording: boolean;
    onToggleRecording: () => void;
    recordSupported: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    isLoading,
    isRecording,
    onToggleRecording,
    recordSupported
}) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 p-3 pb-6 safe-area-pb sticky bottom-0 z-10">
            <div className="max-w-4xl mx-auto flex items-end gap-2">
                <button
                    type="button"
                    onClick={onToggleRecording}
                    disabled={!recordSupported || isLoading}
                    aria-label={isRecording ? 'Arrêter l\'enregistrement vocal' : 'Démarrer l\'enregistrement vocal'}
                    aria-pressed={isRecording}
                    className={`p-3 rounded-2xl transition-all duration-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-uvci-purple focus:ring-offset-2 ${isRecording
                            ? 'bg-red-50 text-red-500 shadow-inner'
                            : 'bg-gray-50 hover:bg-purple-50 text-gray-500 hover:text-uvci-purple'
                        } ${!recordSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isRecording ? (
                        <div className="relative" aria-hidden="true">
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                            <MicOff size={22} />
                        </div>
                    ) : (
                        <Mic size={22} aria-hidden="true" />
                    )}
                </button>

                <form
                    onSubmit={handleSubmit}
                    className="flex-1 bg-gray-50 hover:bg-white focus-within:bg-white border border-gray-100 focus-within:border-uvci-purple/30 rounded-3xl transition-all duration-300 shadow-sm focus-within:shadow-md flex items-end"
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Posez votre question..."
                        disabled={isLoading}
                        aria-label="Zone de saisie de message"
                        aria-describedby="input-help-text"
                        className="w-full bg-transparent border-none focus:ring-0 p-3.5 max-h-32 min-h-[52px] resize-none text-gray-800 placeholder-gray-400 text-[15px] leading-relaxed"
                        rows={1}
                    />
                    <span id="input-help-text" className="sr-only">Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne</span>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        aria-label="Envoyer le message"
                        aria-disabled={!input.trim() || isLoading}
                        className={`mr-2 mb-2 p-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-uvci-purple focus:ring-offset-2 ${input.trim() && !isLoading
                                ? 'bg-uvci-purple text-white shadow-md transform hover:scale-105 active:scale-95'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                                <span className="sr-only">Envoi en cours...</span>
                            </>
                        ) : (
                            <Send size={18} className={input.trim() ? "ml-0.5" : ""} aria-hidden="true" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
