import React from 'react';

interface SuggestionCardsProps {
    onSelect: (text: string) => void;
}

export const SuggestionCards: React.FC<SuggestionCardsProps> = ({ onSelect }) => {
    const suggestions = [
        { emoji: '📝', text: 'Comment s\'inscrire à l\'UVCI ?' },
        { emoji: '📚', text: 'Quels sont les programmes disponibles ?' },
        { emoji: '💰', text: 'Quels sont les frais d\'inscription ?' },
        { emoji: '📅', text: 'Date de la prochaine rentrée ?' },
        { emoji: '📧', text: 'Contacter la scolarité' },
        { emoji: '💼', text: 'Débouchés professionnels' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl px-4 animate-fade-in">
            {suggestions.map((sugg, idx) => (
                <button
                    key={idx}
                    onClick={() => onSelect(sugg.text)}
                    className="bg-white border border-gray-100 hover:border-uvci-purple p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 text-left group"
                >
                    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform duration-300 origin-left">
                        {sugg.emoji}
                    </span>
                    <span className="text-sm font-medium text-gray-700 leading-tight block">
                        {sugg.text}
                    </span>
                </button>
            ))}
        </div>
    );
};
