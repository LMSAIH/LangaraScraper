import { useState, useEffect } from 'react';
import Calendar from '../components/calendar/Calendar';
import Filters from '../components/calendar/RegistrationPage/Filters';
import SectionList from '../components/calendar/RegistrationPage/SectionList'
import SectionDetails from '../components/calendar/RegistrationPage/SectionDetails'
import type { Section, ApiResponse } from '../Types/Registration';
import { fetchSubjects, fetchSections } from '../Api/Requests';
import {
    getCourseStatus,
    createSectionHandlers,
    createSearchHandlers
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

    // Fetch subjects for dropdown
    const getSubjects = async () => {
        try {
            const sub = await fetchSubjects();
            setSubjects(sub.subjects || []);
        } catch (error) {
            setError('Error fetching subjects: ' + (error as Error).message);
            console.error("Error fetching subjects:", error);
        }
    };

    const getSections = async (instructor?: string, subject?: string, courseCode?: string, page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const sections = await fetchSections(pagination, instructor, subject, courseCode, page);

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
        getSubjects();
        getSections();
    }, []);

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

    // Create search handlers using utility function
    const {
        handleSearch,
        handleClearFilters,
        handlePageChange
    } = createSearchHandlers(
        instructorFilter,
        subjectFilter,
        courseCodeFilter,
        setInstructorFilter,
        setSubjectFilter,
        setCourseCodeFilter,
        setPagination,
        getSections
    );

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
        <div>
            <h1 className='text-4xl font-bold mb-6'>Registration</h1>

            <div className='w-full flex flex-row justify-center flex-wrap p-8 gap-6'>

                {/* Course Selection Side */}
                <div className='w-1/4 min-w-80'>



                    {/* Filters Component */}
                    <Filters
                        subjects={subjects}
                        instructorFilter={instructorFilter}
                        subjectFilter={subjectFilter}
                        courseCodeFilter={courseCodeFilter}
                        setInstructorFilter={setInstructorFilter}
                        setSubjectFilter={setSubjectFilter}
                        setCourseCodeFilter={setCourseCodeFilter}
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
                        <div className='mt-4 flex items-center justify-between'>
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

                    {/* Section Details Component */}
                    {selectedSection && (
                        <SectionDetails
                            section={selectedSection}
                            isAdded={addedSections.some(s => s.crn === selectedSection.crn)}
                            onToggleSection={handleSectionClick}
                        />
                    )}


                    {apiResponse && (
                        <div className='mb-4 p-3 bg-blue-50 rounded-lg text-sm'>
                            <div className='font-medium mb-1'>Search Results:</div>
                            <div>Showing {apiResponse.sections.length} of {apiResponse.pagination.total} sections</div>
                            <div>Page {apiResponse.pagination.page} of {apiResponse.pagination.totalPages}</div>
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
                    <div className='mb-4 p-3 bg-gray-50 rounded-lg text-xs'>
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