import { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import axios from 'axios';

interface CourseSearchFiltersProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
    searchTerm: string;
    selectedSubject: string;
    selectedAttribute: string;
}

// Predefined course attributes
const COURSE_ATTRIBUTES = [
    { code: '2AR', description: 'Meets second-year arts requirement' },
    { code: '2SC', description: 'Meets second-year science requirement' },
    { code: 'HUM', description: 'Meets humanities requirement' },
    { code: 'LSC', description: 'Meets lab-science requirement' },
    { code: 'SCI', description: 'Meets science requirement' },
    { code: 'SOC', description: 'Meets social science requirement' },
    { code: 'UT', description: 'Meets "university-transferable" requirements' }
];

const CourseSearchFilters = ({ filters, onFiltersChange }: CourseSearchFiltersProps) => {
    const [subjects, setSubjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await axios.get('http://localhost:3000/courseInfo/subjects');
                setSubjects(response.data.subjects || []);
            } catch (error) {
                console.error('Error fetching subjects:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSubjects();
    }, []);

    // Keep local search term in sync with filters when they change externally (like clear filters)
    useEffect(() => {
        setLocalSearchTerm(filters.searchTerm);
    }, [filters.searchTerm]);

    const handleSearchSubmit = () => {
        onFiltersChange({
            ...filters,
            searchTerm: localSearchTerm
        });
    };


    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearchSubmit();
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-6 mb-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <FaFilter className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Search & Filter Courses
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Search Input */}
                <form onSubmit={handleFormSubmit} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex">
                        <input
                            type="text"
                            placeholder="CPSC 1280"
                            value={localSearchTerm}
                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </form>

                {/* Subject Filter */}
                <select
                    value={filters.selectedSubject}
                    onChange={(e) => onFiltersChange({
                        ...filters,
                        selectedSubject: e.target.value
                    })}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">All Subjects</option>
                    {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                    ))}
                </select>

                {/* Attribute Filter */}
                <select
                    value={filters.selectedAttribute}
                    onChange={(e) => onFiltersChange({
                        ...filters,
                        selectedAttribute: e.target.value
                    })}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">All Attributes</option>
                    {COURSE_ATTRIBUTES.map(attr => (
                        <option key={attr.code} value={attr.code}>
                            {attr.code} - {attr.description}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => {
                        setLocalSearchTerm('');
                        onFiltersChange({
                            searchTerm: '',
                            selectedSubject: '',
                            selectedAttribute: ''
                        });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                    Clear all filters
                </button>
            </div>
        </div>
    );
};

export default CourseSearchFilters;