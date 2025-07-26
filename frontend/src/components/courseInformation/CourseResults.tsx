import { FaBook, FaCaretLeft, FaCaretRight } from 'react-icons/fa';
import CourseCard from './CourseCard';
import type { FilterState } from './CourseSearchFilters';

interface Course {
    courseCode: string;
    title?: string;
    description?: string;
    attributes: string[];
}

interface PaginationInfo {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
}

interface CourseResultsProps {
    courses: Course[];
    pagination: PaginationInfo;
    filters: FilterState;
    loading: boolean;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const CourseResults = ({ 
    courses, 
    pagination, 
    filters, 
    loading, 
    currentPage, 
    onPageChange 
}: CourseResultsProps) => {
    return (
        <>
            {/* Loading indicator for page changes */}
            {loading && currentPage > 1 && (
                <div className="text-center py-4 mb-4">
                    <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Loading...
                    </div>
                </div>
            )}

            {/* Results info */}
            <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                    Showing page {pagination.page} of {pagination.totalPages} 
                </p>
            </div>

            {/* Course Grid */}
            {courses.length === 0 ? (
                <div className="text-center py-12">
                    <FaBook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No courses found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {filters.selectedAttribute || filters.selectedSubject || filters.searchTerm
                            ? 'Try adjusting your search or filter criteria'
                            : 'No courses available at the moment'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {courses.map((course: Course) => (
                        <CourseCard key={course.courseCode} course={course} />
                    ))}
                </div>
            )}

            {/* Advanced Pagination */}
            {pagination.totalPages > 1 && (
                <div className="rounded-2xl p-6  border-gray-200 dark:border-zinc-700 transition-all duration-300 hover:shadow-md w-fit mx-auto">
                    <div className="flex flex-col space-y-3">
                        {/* Page info */}
                        <div className="flex justify-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                        </div>

                        {/* Navigation buttons and page numbers */}
                        <div className="flex justify-center items-center">
                            <div className="flex space-x-1 items-center">
                                {/* Previous button */}
                                <button
                                    onClick={() => onPageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <FaCaretLeft className="w-4 h-4" />
                                </button>

                                {(() => {
                                    const currentPageNum = pagination.page;
                                    const totalPages = pagination.totalPages;
                                    const maxVisiblePages = 5;

                                    let startPage: number;
                                    let endPage: number;

                                    if (totalPages <= maxVisiblePages) {
                                        // Show all pages if total is less than max visible
                                        startPage = 1;
                                        endPage = totalPages;
                                    } else {
                                        // Calculate start and end pages to keep current page centered
                                        const halfVisible = Math.floor(maxVisiblePages / 2);

                                        if (currentPageNum <= halfVisible) {
                                            // Near the beginning
                                            startPage = 1;
                                            endPage = maxVisiblePages;
                                        } else if (currentPageNum + halfVisible >= totalPages) {
                                            // Near the end
                                            startPage = totalPages - maxVisiblePages + 1;
                                            endPage = totalPages;
                                        } else {
                                            // In the middle
                                            startPage = currentPageNum - halfVisible;
                                            endPage = currentPageNum + halfVisible;
                                        }
                                    }

                                    const pages = [];

                                    // Add first page and ellipsis if needed
                                    if (startPage > 1) {
                                        pages.push(
                                            <button
                                                key={1}
                                                onClick={() => onPageChange(1)}
                                                className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600"
                                            >
                                                1
                                            </button>
                                        );
                                        if (startPage > 2) {
                                            pages.push(
                                                <span key="ellipsis1" className="flex items-center px-2 text-gray-400 text-sm">...</span>
                                            );
                                        }
                                    }

                                    // Add visible page numbers
                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(
                                            <button
                                                key={i}
                                                onClick={() => onPageChange(i)}
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${i === currentPageNum
                                                    ? 'bg-blue-500 text-white shadow-md transform scale-105'
                                                    : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                                                    }`}
                                            >
                                                {i}
                                            </button>
                                        );
                                    }

                                    // Add last page and ellipsis if needed
                                    if (endPage < totalPages) {
                                        if (endPage < totalPages - 1) {
                                            pages.push(
                                                <span key="ellipsis2" className="flex items-center px-2 text-gray-400 text-sm">...</span>
                                            );
                                        }
                                        pages.push(
                                            <button
                                                key={totalPages}
                                                onClick={() => onPageChange(totalPages)}
                                                className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600"
                                            >
                                                {totalPages}
                                            </button>
                                        );
                                    }

                                    return pages;
                                })()}

                                {/* Next button */}
                                <button
                                    onClick={() => onPageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <FaCaretRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Course count info */}
                        <div className="flex justify-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Displaying {courses.length} of {pagination.total} courses
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CourseResults;
