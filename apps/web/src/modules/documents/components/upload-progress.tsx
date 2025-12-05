import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { FileUploadState } from '../types/documents.model';

interface UploadProgressProps {
  uploads: FileUploadState[];
  onRemove: (index: number) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return '📄';
    case 'docx': return '📝';
    case 'txt': return '📃';
    case 'md': return '📋';
    default: return '📁';
  }
};

export const UploadProgress: React.FC<UploadProgressProps> = ({
  uploads,
  onRemove,
}) => {
  if (uploads.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">
        Uploads ({uploads.filter(u => u.status === 'success').length}/{uploads.length})
      </h3>

      <div className="space-y-2">
        {uploads.map((upload, index) => (
          <div
            key={`${upload.file.name}-${index}`}
            className="flex items-center gap-3 p-3 bg-white border rounded-lg"
          >
            <span className="text-xl">{getFileIcon(upload.file.name)}</span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {upload.file.name}
                </p>
                <span className="text-xs text-gray-500 ml-2">
                  {formatFileSize(upload.file.size)}
                </span>
              </div>

              {upload.status === 'uploading' && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{upload.progress}%</p>
                </div>
              )}

              {upload.status === 'error' && (
                <p className="text-xs text-red-600 mt-1 truncate" title={upload.error}>
                  {upload.error}
                </p>
              )}

              {upload.status === 'success' && upload.response && (
                <p className="text-xs text-green-600 mt-1">
                  Indexed: {upload.response.contentLength.toLocaleString()} characters
                </p>
              )}
            </div>

            <div className="flex-shrink-0">
              {upload.status === 'uploading' && (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              )}
              {upload.status === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {upload.status === 'error' && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {upload.status === 'idle' && (
                <button
                  onClick={() => onRemove(index)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Remove"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
