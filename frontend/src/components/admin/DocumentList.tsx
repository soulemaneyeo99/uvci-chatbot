'use client';

import React, { useEffect, useState } from 'react';
import { Document } from '@/types';
import { documentsAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { FileText, Trash2, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';

export const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
    
    // Rafraîchir toutes les 5 secondes pour voir le statut d'indexation
    const interval = setInterval(loadDocuments, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await documentsAPI.getDocuments();
      setDocuments(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur chargement documents:', err);
      setError('Impossible de charger les documents');
      setIsLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      await documentsAPI.deleteDocument(documentId);
      setDocuments(prev => prev.filter(d => d.id !== documentId));
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleReindex = async (documentId: string) => {
    try {
      await documentsAPI.reindexDocument(documentId);
      alert('Ré-indexation lancée');
      loadDocuments();
    } catch (err) {
      console.error('Erreur ré-indexation:', err);
      alert('Erreur lors de la ré-indexation');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'indexed':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'processing':
        return <Clock size={18} className="text-yellow-500" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'indexed':
        return 'Indexé';
      case 'processing':
        return 'En cours...';
      case 'error':
        return 'Erreur';
      default:
        return status;
    }
  };

  if (isLoading) {
    return <Loading text="Chargement des documents..." />;
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadDocuments}>Réessayer</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <FileText size={24} className="text-uvci-blue" />
          Documents indexés ({documents.length})
        </h3>
        <Button size="sm" variant="ghost" onClick={loadDocuments}>
          <RefreshCw size={16} className="mr-2" />
          Actualiser
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Aucun document uploadé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <FileText size={20} className="text-gray-400 mt-1" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {doc.original_filename}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(doc.status)}
                      {getStatusText(doc.status)}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>{doc.chunk_count} chunks</span>
                    <span>•</span>
                    <span>{formatDate(doc.upload_date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {doc.status === 'error' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReindex(doc.id)}
                  >
                    <RefreshCw size={14} className="mr-1" />
                    Réindexer
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};