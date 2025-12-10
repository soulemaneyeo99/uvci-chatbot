import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
