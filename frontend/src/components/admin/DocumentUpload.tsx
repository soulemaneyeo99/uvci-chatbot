'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { documentsAPI } from '@/lib/api';

interface UploadResult {
  success: boolean;
  filename: string;
  message: string;
}

export const DocumentUpload: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadResults([]);

    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Vérifier l'extension
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          results.push({
            success: false,
            filename: file.name,
            message: 'Seuls les fichiers PDF sont acceptés',
          });
          continue;
        }

        // Vérifier la taille (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          results.push({
            success: false,
            filename: file.name,
            message: 'Fichier trop volumineux (max 10MB)',
          });
          continue;
        }

        // Upload
        await documentsAPI.uploadDocument(file);
        results.push({
          success: true,
          filename: file.name,
          message: 'Uploadé et indexation en cours',
        });
      } catch (err) {
        results.push({
          success: false,
          filename: file.name,
          message: 'Erreur lors de l\'upload',
        });
      }
    }

    setUploadResults(results);
    setIsUploading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Upload size={24} className="text-uvci-blue" />
        Uploader des documents UVCI
      </h3>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-uvci-blue transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <FileText size={48} className="text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Cliquez pour sélectionner des fichiers PDF
          </p>
          <p className="text-sm text-gray-500">
            ou glissez-déposez vos documents ici
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PDF uniquement • Max 10MB par fichier
          </p>
        </label>
      </div>

      {isUploading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-uvci-blue">
          <div className="w-5 h-5 border-2 border-uvci-blue/30 border-t-uvci-blue rounded-full animate-spin" />
          <span>Upload en cours...</span>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadResults.map((result, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 p-3 rounded-lg ${
                result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {result.success ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span className="flex-1 text-sm">
                <strong>{result.filename}</strong> - {result.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};