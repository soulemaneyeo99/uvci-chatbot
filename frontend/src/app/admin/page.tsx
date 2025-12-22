'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  ArrowLeft,
  FileText,
  Upload,
  Database,
  BarChart3,
  Users,
  MessageSquare,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { documentsAPI } from '@/lib/api';
import { Document } from '@/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'stats'>('overview');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await documentsAPI.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Erreur chargement documents', error);
    }
    setIsLoadingDocs(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.type !== 'application/pdf') {
      setUploadStatus({ message: 'Seuls les fichiers PDF sont acceptés', type: 'error' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      await documentsAPI.uploadDocument(file);
      setUploadStatus({ message: 'Document uploadé et indexé avec succès !', type: 'success' });
      fetchDocuments(); // Refresh list
    } catch (error) {
      setUploadStatus({ message: 'Erreur lors de l\'upload', type: 'error' });
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le document "${doc?.filename || 'ce document'}" ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    try {
      await documentsAPI.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      // Notification de succès
      const notification = document.createElement('div');
      notification.textContent = 'Document supprimé avec succès';
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.setAttribute('role', 'status');
      notification.setAttribute('aria-live', 'polite');
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error('Erreur suppression:', error);
      const errorNotification = document.createElement('div');
      errorNotification.textContent = 'Erreur lors de la suppression. Veuillez réessayer.';
      errorNotification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorNotification.setAttribute('role', 'alert');
      document.body.appendChild(errorNotification);
      setTimeout(() => errorNotification.remove(), 3000);
    }
  };

  const stats = [
    { icon: MessageSquare, label: 'Conversations', value: '---', color: 'text-blue-600' },
    { icon: Users, label: 'Utilisateurs', value: 'Active', color: 'text-green-600' },
    { icon: FileText, label: 'Documents indexés', value: documents.length.toString(), color: 'text-orange-600' },
    { icon: Database, label: 'Vecteurs RAG', value: documents.reduce((acc, doc) => acc + (doc.chunk_count || 0), 0).toString(), color: 'text-purple-600' },
  ];

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-50/50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-uvci-purple transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Retour</span>
                  </button>
                </Link>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Settings className="text-uvci-purple" size={20} />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Administration
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              role="tab"
              aria-selected={activeTab === 'overview'}
              aria-controls="overview-panel"
              id="overview-tab"
              className={`px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-uvci-purple focus:ring-offset-2 ${activeTab === 'overview'
                  ? 'bg-uvci-purple text-white shadow-lg shadow-purple-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                }`}
            >
              <BarChart3 size={18} aria-hidden="true" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              role="tab"
              aria-selected={activeTab === 'documents'}
              aria-controls="documents-panel"
              id="documents-tab"
              className={`px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-uvci-purple focus:ring-offset-2 ${activeTab === 'documents'
                  ? 'bg-uvci-purple text-white shadow-lg shadow-purple-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                }`}
            >
              <FileText size={18} aria-hidden="true" />
              Documents
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in" role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
                        <stat.icon className={stat.color} size={24} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="animate-fade-in space-y-6" role="tabpanel" id="documents-panel" aria-labelledby="documents-tab">
              {/* Upload Section */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-50 p-2.5 rounded-xl">
                    <Upload className="text-uvci-purple" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Ajouter un document</h2>
                    <p className="text-sm text-gray-500">Formats acceptés : PDF (Max 10MB)</p>
                  </div>
                </div>

                <div className="relative border-2 border-dashed border-gray-200 hover:border-uvci-purple/50 rounded-xl p-12 text-center transition-all bg-gray-50/50 hover:bg-purple-50/30 group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    aria-label="Téléverser un document PDF"
                    aria-describedby="upload-help"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                  />
                  <span id="upload-help" className="sr-only">Sélectionnez un fichier PDF à téléverser et indexer</span>
                  <div className="flex flex-col items-center">
                    {isUploading ? (
                      <Loader2 className="animate-spin text-uvci-purple mb-4" size={48} />
                    ) : (
                      <Upload className="text-gray-300 group-hover:text-uvci-purple mb-4 transition-colors" size={48} />
                    )}
                    <p className="text-gray-900 font-medium mb-2">
                      {isUploading ? 'Indexation en cours...' : 'Cliquez ou glissez un fichier ici'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Le document sera automatiquement analysé et indexé
                    </p>
                  </div>
                </div>

                {uploadStatus && (
                  <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${uploadStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {uploadStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium text-sm">{uploadStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Documents List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Documents indexés</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
                    {documents.length} fichiers
                  </span>
                </div>

                {isLoadingDocs ? (
                  <div className="p-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-gray-300" size={32} />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <FileText className="mx-auto mb-3 text-gray-300" size={48} />
                    <p>Aucun document pour le moment</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{doc.filename}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {doc.chunk_count} segments
                              </span>
                              <span className="text-xs text-gray-400">
                                ID: {doc.id.slice(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(doc.id)}
                          aria-label={`Supprimer le document: ${doc.filename}`}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:opacity-100"
                          title="Supprimer"
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
