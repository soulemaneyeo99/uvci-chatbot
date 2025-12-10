import React from 'react';
import { MarkdownMessage } from './MarkdownMessage';
import { GraduationCap, Volume2, VolumeX, User } from 'lucide-react';
import { Message } from '@/types';

interface ChatBubbleProps {
    message: Message;
    isSpeaking: boolean;
    onSpeak: (text: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isSpeaking, onSpeak }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 px-1`}>
            <div
                className={`max-w-[90%] sm:max-w-[80%] relative group transition-all duration-300 ${isUser
                        ? 'bg-gradient-to-br from-uvci-purple to-purple-700 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-purple-900/10'
                        : 'bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm'
                    }`}
            >
                {/* Header (Avatar + Name) */}
                {!isUser && (
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-uvci-purple to-uvci-green flex items-center justify-center shadow-sm">
                            <GraduationCap className="text-white" size={14} />
                        </div>
                        <span className="text-xs font-bold bg-gradient-to-r from-uvci-purple to-purple-600 bg-clip-text text-transparent">
                            Assistant UVCI
                        </span>
                    </div>
                )}

                {/* Content */}
                <div className={`px-4 py-3 ${isUser ? 'text-white' : 'text-gray-800'}`}>
                    <MarkdownMessage content={message.content} isUser={isUser} />
                </div>

                {/* Footer (Sources + Time + Actions) */}
                <div className={`px-4 pb-3 flex flex-col gap-2`}>
                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && !isUser && (
                        <div className="pt-2 border-t border-dashed border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Sources vérifiées</p>
                            <div className="flex flex-wrap gap-1.5">
                                {message.sources.map((source, idx) => (
                                    <span key={idx} className="bg-purple-50 text-uvci-purple text-[10px] px-2 py-1 rounded-md border border-purple-100 font-medium truncate max-w-[150px]">
                                        {source}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Time & Actions */}
                    <div className={`flex items-center justify-between pt-1 ${isUser ? 'border-t border-white/10' : 'border-t border-gray-50'}`}>
                        <span className={`text-[10px] ${isUser ? 'text-purple-200' : 'text-gray-400'}`}>
                            {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {!isUser && (
                            <button
                                onClick={() => onSpeak(message.content)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-uvci-purple"
                                title="Lire à haute voix"
                            >
                                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
