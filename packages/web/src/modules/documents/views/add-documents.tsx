import React from 'react';
import { useFileUpload } from '../hooks/use-documents';
import { FileDropZone } from '../components/file-drop-zone';
import { UploadProgress } from '../components/upload-progress';

export const AddDocuments: React.FC = () => {
  const fileUpload = useFileUpload();

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Add Documents</h2>
        <p className="text-gray-600 mb-6">
          Upload files to add to the knowledge base. Supported formats: PDF, DOCX, TXT, MD.
        </p>

        <div className="space-y-6">
          <FileDropZone
            onFilesSelected={fileUpload.addFiles}
            disabled={fileUpload.isUploading}
          />

          <UploadProgress
            uploads={fileUpload.uploads}
            onRemove={fileUpload.removeFile}
          />

          {fileUpload.uploads.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                {fileUpload.stats.success > 0 && (
                  <button
                    onClick={fileUpload.clearCompleted}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear completed
                  </button>
                )}
                <button
                  onClick={fileUpload.clearAll}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              </div>

              <button
                onClick={fileUpload.uploadAll}
                disabled={fileUpload.isUploading || fileUpload.stats.pending === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {fileUpload.isUploading
                  ? `Uploading (${fileUpload.stats.uploading}/${fileUpload.stats.total})...`
                  : `Upload ${fileUpload.stats.pending} file${fileUpload.stats.pending !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
