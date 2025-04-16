
import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { usePromptHistory } from '@/hooks/usePromptHistory';
import PromptExplorerList from '@/components/explorer/PromptExplorerList';
import PromptExplorerHeader from '@/components/explorer/PromptExplorerHeader';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 6;

const PromptExplorer = () => {
  const { history, isLoading, isInitialized, loadHistory, handleDeletePrompt } = usePromptHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  
  // Filter prompts based on search term
  const filteredPrompts = useMemo(() => {
    return searchTerm
      ? history.filter(prompt => 
          prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prompt.modelUsed?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : history;
  }, [history, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE);
  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPrompts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPrompts, currentPage]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Loading state
  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 pt-20 pb-12 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 pt-20 pb-12 space-y-6">
        <PromptExplorerHeader 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          promptCount={history.length}
          onBack={() => navigate('/')}
        />
        
        <PromptExplorerList 
          prompts={paginatedPrompts}
          onDelete={handleDeletePrompt}
        />

        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                
                // Show first page, current page, last page, and pages around current
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        isActive={page === currentPage} 
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Show ellipsis for gaps
                if (page === 2 || page === totalPages - 1) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default PromptExplorer;
