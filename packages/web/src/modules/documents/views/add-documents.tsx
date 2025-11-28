import React, { useState } from 'react';
import { useAddDocuments } from '../hooks/use-documents';

export const AddDocuments: React.FC = () => {
  const [content, setContent] = useState('');

  const mutation = useAddDocuments();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || mutation.isPending) return;

    const documents = [content.trim()];

    mutation.mutate(documents, {
      onSuccess: () => {
        setContent('');
      },
    });
  };

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Add Documents</h2>
        <p className="text-gray-600 mb-6">
          Add documents to the knowledge base. Use markdown headings (# ## ###) to organize content into searchable sections.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter document content here...

Use markdown headings (# ## ###) to organize your content.
The system will automatically split it into chunks by heading.

Example:
# Main Topic
Content here...

## Subtopic
More content..."
            rows={15}
            disabled={mutation.isPending}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm disabled:bg-gray-100"
          />

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={!content.trim() || mutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {mutation.isPending ? 'Adding...' : 'Add Documents'}
            </button>

            {mutation.isSuccess && (
              <p className="text-green-600 font-medium">
                ✓ Documents added successfully!
              </p>
            )}

            {mutation.isError && (
              <p className="text-red-600 font-medium">
                ✗ Failed to add documents
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
