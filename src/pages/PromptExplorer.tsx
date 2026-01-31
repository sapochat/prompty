import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { usePromptHistory } from '@/hooks/usePromptHistory';
import PromptExplorerList from '@/components/explorer/PromptExplorerList';
import PromptExplorerHeader from '@/components/explorer/PromptExplorerHeader';
import { useNavigate } from 'react-router-dom';
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
  const { history, isLoading, isInitialized, handleDeletePrompt } = usePromptHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const filteredPrompts = useMemo(() => {
    return searchTerm
      ? history.filter(prompt =>
          prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prompt.modelUsed?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : history;
  }, [history, searchTerm]);

  const totalPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE);
  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPrompts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPrompts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen relative">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212, 165, 116, 0.04), transparent 70%)',
          }}
          aria-hidden="true"
        />
        <Header />
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16 flex-center">
          <div className="spinner h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212, 165, 116, 0.04), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <Header />

      <main className="container max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="space-y-8">
          <PromptExplorerHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            promptCount={history.length}
            onBack={() => navigate('/')}
          />

          <div className="editorial-card p-6">
            <PromptExplorerList
              prompts={paginatedPrompts}
              onDelete={handleDeletePrompt}
            />

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer hover:bg-background-elevated"}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;

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
                            className={`cursor-pointer ${page === currentPage ? 'bg-primary text-background' : 'hover:bg-background-elevated'}`}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

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
                      className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer hover:bg-background-elevated"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PromptExplorer;
