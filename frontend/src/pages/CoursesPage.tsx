import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import CourseSearchFilters from '../components/courseInformation/CourseSearchFilters';
import CourseHeader from '../components/courseInformation/CourseHeader';
import CourseResults from '../components/courseInformation/CourseResults';
import type { FilterState } from '../components/courseInformation/CourseSearchFilters';

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

interface CourseResponse {
    courses: Course[];
    pagination: PaginationInfo;
}

const CoursesPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        totalPages: 1,
        total: 0,
        limit: 20
    });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Filter state
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: '',
        selectedSubject: '',
        selectedAttribute: ''
    });

    // Fetch courses function
    const fetchCourses = async (page: number, currentFilters: FilterState) => {
        try {
            setLoading(true);
            
            // Use the main endpoint with all filters as query parameters for stackable filtering
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });

            // Add server-side filters - all can be combined now
            if (currentFilters.selectedSubject) {
                params.append('subject', currentFilters.selectedSubject);
            }
            
            if (currentFilters.searchTerm) {
                params.append('courseCode', currentFilters.searchTerm);
            }

            if (currentFilters.selectedAttribute) {
                params.append('attribute', currentFilters.selectedAttribute);
            }

            const response = await axios.get<CourseResponse>(`http://localhost:3000/courseInfo/?${params}`);

            setCourses(response.data.courses);
            setPagination(response.data.pagination);
            
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchCourses(1, filters);
    }, []);

    // Handle filter changes
    const handleFiltersChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setCurrentPage(1);
        fetchCourses(1, newFilters);
    };

    // Handle page changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchCourses(page, filters);    
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && currentPage === 1) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <CourseHeader totalCourses={pagination.total} />

                <CourseSearchFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                />

                <CourseResults
                    courses={courses}
                    pagination={pagination}
                    filters={filters}
                    loading={loading}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default CoursesPage;
