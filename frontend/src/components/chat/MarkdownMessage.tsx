import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
  isStreaming?: boolean;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ 
  content, 
  isUser = false,
  isStreaming = false
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Si c'est un message utilisateur ou pas de streaming, afficher directement
    if (isUser || !isStreaming) {
      setDisplayedContent(content);
      setIsComplete(true);
      return;
    }

    // Reset pour nouveau streaming
    setDisplayedContent('');
    setIsComplete(false);
    
    let currentIndex = 0;
    const words = content.split(' ');
    
    const typeNextWord = () => {
      if (currentIndex < words.length) {
        setDisplayedContent(prev => {
          const newContent = currentIndex === 0 
            ? words[currentIndex] 
            : prev + ' ' + words[currentIndex];
          return newContent;
        });
        
        currentIndex++;
        
        // Vitesse variable : plus rapide pour les mots courts
        const wordLength = words[currentIndex - 1]?.length || 0;
        const delay = Math.max(30, Math.min(80, wordLength * 8));
        
        timeoutRef.current = setTimeout(typeNextWord, delay);
      } else {
        setIsComplete(true);
      }
    };

    typeNextWord();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, isUser, isStreaming]);

  return (
    <div 
      className={
        isUser 
          ? 'markdown-content markdown-user' 
          : 'markdown-content markdown-assistant'
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 
              className="text-2xl font-bold mb-4 mt-6 text-purple-900 border-b-2 border-purple-200 pb-2" 
              {...props} 
            />
          ),
          h2: ({ node, ...props }) => (
            <h2 
              className="text-xl font-bold mb-3 mt-5 text-purple-900" 
              {...props} 
            />
          ),
          h3: ({ node, ...props }) => (
            <h3 
              className="text-lg font-semibold mb-2 mt-4 text-purple-900" 
              {...props} 
            />
          ),
          h4: ({ node, ...props }) => (
            <h4 
              className="text-base font-semibold mb-2 mt-3 text-gray-800" 
              {...props} 
            />
          ),
          p: ({ node, ...props }) => (
            <p 
              className="mb-3 leading-relaxed" 
              {...props} 
            />
          ),
          ul: ({ node, ...props }) => (
            <ul 
              className="list-none space-y-2 mb-4 ml-4" 
              {...props} 
            />
          ),
          ol: ({ node, ...props }) => (
            <ol 
              className="list-decimal space-y-2 mb-4 ml-6" 
              {...props} 
            />
          ),
          li: ({ node, children, ...props }) => (
            <li 
              className="flex items-start gap-2" 
              {...props}
            >
              <span className="text-green-600 mt-1 flex-shrink-0">✓</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          a: ({ node, children, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 hover:text-purple-900 underline font-medium transition-colors"
              {...props}
            >
              {children} 🔗
            </a>
          ),
          strong: ({ node, children, ...props }) => (
            <strong 
              className="font-bold text-purple-900" 
              {...props}
            >
              {children}
            </strong>
          ),
          em: ({ node, children, ...props }) => (
            <em 
              className="italic" 
              {...props}
            >
              {children}
            </em>
          ),
          code: (props: any) => {
            const { inline, children, ...rest } = props;
            if (inline) {
              return (
                <code 
                  className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded-lg text-sm font-mono border border-purple-100" 
                  {...rest}
                >
                  {children}
                </code>
              );
            }
            return (
              <code 
                className="block bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm font-mono my-3" 
                {...rest}
              >
                {children}
              </code>
            );
          },
          pre: (props: any) => {
            const { children, ...rest } = props;
            return (
              <pre 
                className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm font-mono my-3 shadow-lg" 
                {...rest}
              >
                {children}
              </pre>
            );
          },
          blockquote: ({ node, children, ...props }) => (
            <blockquote 
              className="border-l-4 border-purple-700 pl-4 py-2 my-3 italic bg-purple-50 rounded-r-xl" 
              {...props}
            >
              {children}
            </blockquote>
          ),
          hr: ({ node, ...props }) => (
            <hr 
              className="my-6 border-t-2 border-purple-200 rounded-full" 
              {...props} 
            />
          ),
          table: ({ node, children, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-gray-200 shadow-sm">
              <table 
                className="min-w-full border-collapse" 
                {...props}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ node, children, ...props }) => (
            <thead 
              className="bg-gradient-to-r from-purple-800 to-purple-700 text-white" 
              {...props}
            >
              {children}
            </thead>
          ),
          tbody: ({ node, children, ...props }) => (
            <tbody 
              className="divide-y divide-gray-200 bg-white" 
              {...props}
            >
              {children}
            </tbody>
          ),
          tr: ({ node, children, ...props }) => (
            <tr 
              className="hover:bg-purple-50 transition-colors" 
              {...props}
            >
              {children}
            </tr>
          ),
          th: ({ node, children, ...props }) => (
            <th 
              className="px-4 py-3 text-left font-semibold border-r border-purple-600 last:border-r-0" 
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ node, children, ...props }) => (
            <td 
              className="px-4 py-3 border-r border-gray-200 last:border-r-0" 
              {...props}
            >
              {children}
            </td>
          ),
        }}
      >
        {displayedContent}
      </ReactMarkdown>
      
      {/* Curseur clignotant pendant l'écriture */}
      {!isComplete && !isUser && isStreaming && (
        <span className="inline-block w-1.5 h-5 bg-purple-600 ml-0.5 animate-pulse rounded-sm"></span>
      )}
    </div>
  );
};