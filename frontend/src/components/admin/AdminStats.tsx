'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { documentsAPI, historyAPI } from '@/lib/api';
import { MessageSquare, FileText, Users, TrendingUp } from 'lucide-react';

interface Stats {
  totalConversations: number;
  totalDocuments: number;
  indexedDocuments: number;
  totalMessages: number;
}

export const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalConversations: 0,
    totalDocuments: 0,
    indexedDocuments: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [conversations, documents] = await Promise.all([
        historyAPI.getConversations(),
        documentsAPI.getDocuments(),
      ]);

      const totalMessages = conversations.reduce(
        (sum, conv) => sum + (conv.message_count || 0),
        0
      );

      const indexedDocs = documents.filter(doc => doc.status === 'indexed').length;

      setStats({
        totalConversations: conversations.length,
        totalDocuments: documents.length,
        indexedDocuments: indexedDocs,
        totalMessages,
      });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    }
  };

  const statCards = [
    {
      label: 'Conversations',
      value: stats.totalConversations,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Messages totaux',
      value: stats.totalMessages,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Documents indexés',
      value: stats.indexedDocuments,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, idx) => (
        <Card key={idx} className="hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};