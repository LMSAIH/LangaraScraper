import { FaBook } from 'react-icons/fa';
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

            {/* Simple Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        Previous
                    </button>
                    
                    <span className="text-gray-600 dark:text-gray-400">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    );
};

export default CourseResults;
