import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

const PaginationControls = ({ 
  pagination, 
  onPageChange, 
  onPageSizeChange,
  className = '' 
}) => {
  const [goToPage, setGoToPage] = useState('');

  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage
  } = pagination;

  const pageSizes = [6, 9, 12, 18, 24];

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (pageNum && pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
      onPageChange(pageNum);
      setGoToPage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  const formatItemCount = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return `${start}-${end} of ${totalItems}`;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Results Summary and Page Size */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{formatItemCount()}</span> tickets
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              className="border border-gray-200 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        {/* Previous/First Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={!hasPrevPage}
            className={`p-2 rounded-lg ${
              !hasPrevPage
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(prevPage)}
            disabled={!hasPrevPage}
            className={`p-2 rounded-lg ${
              !hasPrevPage
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  onClick={() => handlePageClick(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium min-w-[2.5rem] ${
                    page === currentPage
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next/Last Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(nextPage)}
            disabled={!hasNextPage}
            className={`p-2 rounded-lg ${
              !hasNextPage
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            className={`p-2 rounded-lg ${
              !hasNextPage
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Go to Page */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Go to page:</span>
          <input
            type="number"
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`1-${totalPages}`}
            min="1"
            max={totalPages}
            className="w-20 px-3 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGoToPage}
            disabled={!goToPage || parseInt(goToPage) < 1 || parseInt(goToPage) > totalPages}
            className="px-4 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Go
          </button>
        </div>
        
        {/* Quick Jump for Large Page Counts */}
        {totalPages > 10 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Quick jump:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onPageChange(parseInt(e.target.value));
                }
              }}
              className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select page</option>
              {[1, 5, 10, 15, 20].filter(page => page <= totalPages).map(page => (
                <option key={page} value={page}>Page {page}</option>
              ))}
              {totalPages > 20 && (
                <option value={totalPages}>Last Page ({totalPages})</option>
              )}
            </select>
          </div>
        )}
      </div>

      {/* Page Info */}
      <div className="mt-3 text-center text-xs text-gray-500">
        Page {currentPage} of {totalPages} • {totalItems} total tickets
      </div>
    </div>
  );
};

export default PaginationControls;