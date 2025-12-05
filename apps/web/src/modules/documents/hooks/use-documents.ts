import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { documentsApi } from '../api/documents.api';
import type {
  AddDocumentsResponse,
  AddDocumentsRequest,
  FileUploadState,
} from '../types/documents.model';

export const useAddDocuments = () => {
  return useMutation<AddDocumentsResponse, Error, string[]>({
    mutationFn: async (content: string[]) => {
      if (!content || content.length === 0) {
        throw new Error('Content cannot be empty');
      }

      const validContent = content
        .map(doc => doc.trim())
        .filter(doc => doc.length > 0);

      if (validContent.length === 0) {
        throw new Error('No valid documents provided');
      }

      const oversizedDocs = validContent.filter(doc => doc.length > 10000);
      if (oversizedDocs.length > 0) {
        throw new Error(`${oversizedDocs.length} document(s) exceed maximum size of 10,000 characters`);
      }

      const request: AddDocumentsRequest = {
        content: validContent,
      };

      return await documentsApi.addDocuments(request);
    },
  });
};

export const useFileUpload = () => {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback((files: File[]) => {
    const newUploads: FileUploadState[] = files.map((file) => ({
      file,
      status: 'idle',
      progress: 0,
    }));
    setUploads((prev) => [...prev, ...newUploads]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads((prev) => prev.filter((u) => u.status !== 'success'));
  }, []);

  const clearAll = useCallback(() => {
    setUploads([]);
  }, []);

  const uploadAll = useCallback(async () => {
    const pendingUploads = uploads.filter((u) => u.status === 'idle');
    if (pendingUploads.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < uploads.length; i++) {
      if (uploads[i].status !== 'idle') continue;

      // Mark as uploading
      setUploads((prev) =>
        prev.map((u, idx) =>
          idx === i ? { ...u, status: 'uploading', progress: 0 } : u
        )
      );

      try {
        const response = await documentsApi.uploadDocument(
          uploads[i].file,
          (progress) => {
            setUploads((prev) =>
              prev.map((u, idx) => (idx === i ? { ...u, progress } : u))
            );
          }
        );

        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? { ...u, status: 'success', progress: 100, response }
              : u
          )
        );
      } catch (error: any) {
        const message = error.response?.data?.message || error.message || 'Upload failed';
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i ? { ...u, status: 'error', error: message } : u
          )
        );
      }
    }

    setIsUploading(false);
  }, [uploads]);

  const stats = {
    total: uploads.length,
    pending: uploads.filter((u) => u.status === 'idle').length,
    uploading: uploads.filter((u) => u.status === 'uploading').length,
    success: uploads.filter((u) => u.status === 'success').length,
    error: uploads.filter((u) => u.status === 'error').length,
  };

  return {
    uploads,
    isUploading,
    stats,
    addFiles,
    removeFile,
    clearCompleted,
    clearAll,
    uploadAll,
  };
};
