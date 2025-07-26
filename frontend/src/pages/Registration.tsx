import { useState, useEffect } from 'react';
import Calendar from '../components/calendar/Calendar';
import Filters from '../components/calendar/RegistrationPage/Filters';
import SectionList from '../components/calendar/RegistrationPage/SectionList'
import SavedScheduleModal from '../components/SavedScheduleModal';
import type { Section, ApiResponse } from '../Types/Registration';
import { fetchSubjects, fetchSections, fetchTerms } from '../Api/Requests';
import {
    getCourseStatus,
    createSectionHandlers
} from '../Utils/RegistrationUtils';
import { ICSExporter } from '../Utils/ICSExport';
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa';

const Registration = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [hoveredSection, setHoveredSection] = useState<Section | null>(null);
    const [addedSections, setAddedSections] = useState<Section[]>([]);
    const [instructorFilter, setInstructorFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [courseCodeFilter, setCourseCodeFilter] = useState('');
    const [subjects, setSubjects] = useState<string[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
    });
    const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
    const [terms, setTerms] = useState<string[]>([]);
    const [term, setTerm] = useState<string>('');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const [yearFilter, setYearFilter] = useState<number>(2025);
    const [semesterFilter, setSemesterFilter] = useState<number>(30);

    // Fetch terms from API
    const getTerms = async () => {
        try {
            setLoading(true);
            const terms = await fetchTerms();
            if (!terms || terms.length === 0) {
                throw new Error('No terms available');
            }

            if( terms.length - 3 < 3){
                setTerms(terms);
            } else {
                setTerms(terms.slice(terms.length - 3));
            }

            setTerm(terms[terms.length - 1]);

        } catch (error) {
            setError('Error fetching terms: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    }

    // Parse term to get year and semester
    const parseTermToYearSemester = (termString: string) => {
        if (termString.length === 6) {
            const year = parseInt(termString.substring(0, 4));
            const semester = parseInt(termString.substring(4, 6));
            return { year, semester };
        }
        return null;
    };

    // Handle term change and update year/semester
    const handleTermChange = (newTerm: string) => {
        setTerm(newTerm);
        const parsed = parseTermToYearSemester(newTerm);
        if (parsed) {
            setYearFilter(parsed.year);
            setSemesterFilter(parsed.semester);
        }
    };

    // Fetch subjects for dropdown
    const getSubjects = async (year: number, semester: number) => {
        try {
            const sub = await fetchSubjects(year, semester);
            setSubjects(sub.subjects || []);
        } catch (error) {
            setError('Error fetching subjects: ' + (error as Error).message);
            console.error("Error fetching subjects:", error);
        }
    };

    // Fetch sections based on filters
    const getSections = async (year: number, semester: number, instructor?: string, subject?: string, courseCode?: string, page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const sections = await fetchSections(pagination, year, semester, instructor, subject, courseCode, page);

            if (sections.success) {
                setSections(sections.sections);
                setPagination(sections.pagination);
                setApiResponse(sections);
            } else {
                setError('Failed to fetch sections');
            }
        } catch (err) {
            setError('Error fetching sections: ' + (err as Error).message);
            console.error('Error fetching sections:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTerms();
    }, []);

    // Update year/semester when term changes
    useEffect(() => {
        if (term) {
            const parsed = parseTermToYearSemester(term);
            if (parsed) {
                setYearFilter(parsed.year);
                setSemesterFilter(parsed.semester);
            }
        }
    }, [term]);

    // Fetch subjects and sections when year/semester changes
    useEffect(() => {
        if (yearFilter && semesterFilter) {
            getSubjects(yearFilter, semesterFilter);
            getSections(yearFilter, semesterFilter);
        }
    }, [yearFilter, semesterFilter]);

    // Create section handlers using utility function
    const {
        handleAddSection,
        handleRemoveSection,
        handleSectionHover,
        handleSectionLeave
    } = createSectionHandlers(
        setSections,
        setSelectedSection,
        setHoveredSection,
        setAddedSections,
        addedSections
    );

    // Save schedule handlers
    const handleOpenSaveModal = () => {
        setIsSaveModalOpen(true);
    };

    const handleCloseSaveModal = () => {
        setIsSaveModalOpen(false);
    };

    const handleLoadSchedule = (sections: Section[]) => {
        setAddedSections(sections);
    };

    const handleExportICS = () => {
        ICSExporter.exportToICS(addedSections, term);
    };

    // Create search handlers directly
    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        getSections(yearFilter, semesterFilter, instructorFilter, subjectFilter, courseCodeFilter, 1);
    };

    const handleClearFilters = () => {
        setInstructorFilter('');
        setSubjectFilter('');
        setCourseCodeFilter('');
        setPagination(prev => ({ ...prev, page: 1 }));
        getSections(yearFilter, semesterFilter, '', '', '', 1);
    };

    const handlePageChange = (newPage: number) => {
        getSections(yearFilter, semesterFilter, instructorFilter, subjectFilter, courseCodeFilter, newPage);
    };

    // Handle section click - toggle add/remove
    const handleSectionClick = (section: Section) => {
        setSelectedSection(section);

        const isAlreadyAdded = addedSections.find(s => s.crn === section.crn);
        const isCancelled = getCourseStatus(section) === 'cancelled';

        if (isCancelled) return; // Don't allow adding/removing cancelled courses

        if (isAlreadyAdded) {
            // Remove if already added
            handleRemoveSection(section.crn);
        } else {
            // Add if not already added
            handleAddSection(section);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-6 h-full">

                    {/* Left Sidebar - Course Selection */}
                    <div className="w-full lg:w-1/3 flex flex-col space-y-6 self-start animate-slide-up ">

                        {/* Filters Section */}
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 transition-all duration-300 hover:shadow-md overflow-hidden">
                            <Filters
                                subjects={subjects}
                                terms={terms}
                                instructorFilter={instructorFilter}
                                subjectFilter={subjectFilter}
                                courseCodeFilter={courseCodeFilter}
                                setInstructorFilter={setInstructorFilter}
                                setSubjectFilter={setSubjectFilter}
                                setCourseCodeFilter={setCourseCodeFilter}
                                setTerm={handleTermChange}
                                setError={setError}
                                onSearch={handleSearch}
                                onClearFilters={handleClearFilters}
                                addedSections={addedSections}
                                currentTerm={term}
                                onOpenSaveModal={handleOpenSaveModal}
                                onExportICS={handleExportICS}
                            />
                        </div>

                        {/* Course List Section */}
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 transition-all duration-300 hover:shadow-md overflow-hidden flex-1 min-h-0">
                            <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Available Courses
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {sections.length} courses
                                        </div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <SectionList
                                    sections={sections}
                                    selectedSection={selectedSection}
                                    addedSections={addedSections}
                                    loading={loading}
                                    error={error}
                                    onSectionClick={handleSectionClick}
                                    onSectionHover={handleSectionHover}
                                    onSectionLeave={handleSectionLeave}
                                    onToggleSection={handleSectionClick}
                                />
                            </div>
                        </div>

                        {/* Pagination */}
                        {!loading && pagination.totalPages > 1 && (
                            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700 transition-all duration-300 hover:shadow-md">
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
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 1}
                                                className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                <FaCaretLeft className="w-4 h-4" />
                                            </button>

                                            {(() => {
                                                const currentPage = pagination.page;
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

                                                    if (currentPage <= halfVisible) {
                                                        // Near the beginning
                                                        startPage = 1;
                                                        endPage = maxVisiblePages;
                                                    } else if (currentPage + halfVisible >= totalPages) {
                                                        // Near the end
                                                        startPage = totalPages - maxVisiblePages + 1;
                                                        endPage = totalPages;
                                                    } else {
                                                        // In the middle
                                                        startPage = currentPage - halfVisible;
                                                        endPage = currentPage + halfVisible;
                                                    }
                                                }

                                                const pages = [];

                                                // Add first page and ellipsis if needed
                                                if (startPage > 1) {
                                                    pages.push(
                                                        <button
                                                            key={1}
                                                            onClick={() => handlePageChange(1)}
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
                                                            onClick={() => handlePageChange(i)}
                                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${i === currentPage
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
                                                            onClick={() => handlePageChange(totalPages)}
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
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.totalPages}
                                                className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                <FaCaretRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {apiResponse && <div className="flex justify-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                            Displaying {apiResponse.count} of {apiResponse.pagination.total} sections
                                        </span>
                                    </div>}
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Right Side - Calendar */}
                    <div className="  animate-slide-up w-full lg:w-2/3 self-start" style={{ animationDelay: '0.1s' }}>
                        <div className=" rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 transition-all duration-300 hover:shadow-md overflow-hidden h-full flex flex-col">
                            <div className="p-2 border-b border-gray-200 dark:border-zinc-700">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Selected Courses List */}
                                    {addedSections.length > 0 && (
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap gap-2 justify-start">
                                                {addedSections.map((section) => (
                                                    <div
                                                        key={section.crn}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-900/50 group"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-medium leading-tight">{section.courseCode}</span>
                                                            <span className="text-xs text-blue-600 dark:text-blue-300 leading-tight">CRN: {section.crn}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveSection(section.crn)}
                                                            className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800 hover:bg-red-200 dark:hover:bg-red-800 text-blue-600 dark:text-blue-300 hover:text-red-600 dark:hover:text-red-300 transition-all duration-200 flex items-center justify-center"
                                                            title={`Remove ${section.courseCode}`}
                                                        >
                                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 p-4 pb-6 overflow-auto">
                                <Calendar
                                    selectedSection={selectedSection}
                                    hoveredSection={hoveredSection}
                                    onAddSection={handleAddSection}
                                    addedSections={addedSections}
                                    onRemoveSection={handleRemoveSection}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Schedule Modal */}
            <SavedScheduleModal
                isOpen={isSaveModalOpen}
                onClose={handleCloseSaveModal}
                currentSections={addedSections}
                currentTerm={term}
                onLoadSchedule={handleLoadSchedule}
            />
        </div>
    );
};

export default Registration;