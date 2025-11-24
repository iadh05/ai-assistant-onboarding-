import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar, type ViewMode } from './modules/global';
import { Chat } from './modules/chat';
import { AddDocuments } from './modules/documents';
import { HealthCheck } from './modules/health';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('chat');

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <Chat />;
      case 'documents':
        return <AddDocuments />;
      case 'health':
        return <HealthCheck />;
      default:
        return <Chat />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {renderView()}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
