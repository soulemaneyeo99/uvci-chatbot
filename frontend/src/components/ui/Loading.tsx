import React from 'react';

interface LoadingProps {
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text = 'Chargement...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-[#8B1874] rounded-full animate-spin mb-4" />
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  );
};

export const TypingIndicator: React.FC = () => {
  return (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};
