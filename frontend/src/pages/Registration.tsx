import { useState, useEffect } from 'react';
import Calendar from '../components/calendar/Calendar';
import Filters from '../components/calendar/RegistrationPage/Filters';
import SectionList from '../components/calendar/RegistrationPage/SectionList'
import type { Section, ApiResponse } from '../Types/Registration';
import { fetchSubjects, fetchSections, fetchTerms } from '../Api/Requests';
import {
    getCourseStatus,
    createSectionHandlers
} from '../Utils/RegistrationUtils';

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

    const [yearFilter, setYearFilter] = useState<number>(2025);
    const [semesterFilter, setSemesterFilter] = useState<number>(30);

    const getTerms = async () => {
        try {
            setLoading(true);
            const terms = await fetchTerms();
            if (!terms || terms.length === 0) {
                throw new Error('No terms available');
            }

            setTerms(terms);
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
        addedSections,
    );

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
        <div className="bg-neutral-100">
            <div className='w-full flex flex-row justify-center flex-wrap p-8 gap-6'>

                {/* Course Selection Side */}
                <div className='w-1/4 min-w-80'>

                    {/* Filters Component */}
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
                    />

                    {/* Section List Component */}
                    <SectionList
                        sections={sections}
                        selectedSection={selectedSection}
                        addedSections={addedSections}
                        loading={loading}
                        error={error}
                        onSectionClick={handleSectionClick}
                        onSectionHover={handleSectionHover}
                        onSectionLeave={handleSectionLeave}
                    />

                    {/* Pagination */}
                    {!loading && pagination.totalPages > 1 && (
                        <div className='my-4 flex items-center justify-between'>
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className='px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
                            >
                                Previous
                            </button>

                            <span className='text-sm text-gray-600'>
                                Page {pagination.page} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className='px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {apiResponse && (
                        <div className='my-4 p-3 bg-blue-50 rounded-lg text-sm'>
                            <div className='font-medium mb-1'>Search Results:</div>
                            <div>Showing {apiResponse.sections.length} of {apiResponse.pagination.total} sections</div>
                            <div>Page {apiResponse.pagination.page} of {apiResponse.pagination.totalPages}</div>
                            <div className='text-blue-600'>Year: {yearFilter}, Semester: {semesterFilter}</div>
                            {apiResponse.filters.instructor && (
                                <div className='text-blue-600'>Filtered by instructor: {apiResponse.filters.instructor}</div>
                            )}
                            {apiResponse.filters.subject && (
                                <div className='text-blue-600'>Filtered by subject: {apiResponse.filters.subject}</div>
                            )}
                            {apiResponse.filters.courseCode && (
                                <div className='text-blue-600'>Filtered by course code: {apiResponse.filters.courseCode}</div>
                            )}
                        </div>
                    )}

                    {/* Legend */}
                    <div className='my-4 p-3 bg-gray-50 rounded-lg text-xs'>
                        <div className='font-medium mb-2'>Status Legend:</div>
                        <div className='flex items-center gap-2 mb-1'>
                            <div className='w-3 h-3 bg-green-500 rounded'></div>
                            <span>Regular In-Person Course</span>
                        </div>
                        <div className='flex items-center gap-2 mb-1'>
                            <div className='w-3 h-3 bg-yellow-500 rounded'></div>
                            <span>Online/TBA Course</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className='w-3 h-3 bg-red-500 rounded'></div>
                            <span>Cancelled Course</span>
                        </div>
                        <div className='text-xs text-gray-600 mt-2 italic'>
                            Click on any course to add/remove it from your schedule
                        </div>
                    </div>

                </div>

                {/* Calendar Side */}
                <div className='w-7/12'>
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
    );
};

export default Registration;