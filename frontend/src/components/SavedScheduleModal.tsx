import React, { useState, useEffect } from 'react';
import { ScheduleStorage, type SavedSchedule } from '../Utils/ScheduleStorage';

interface SavedScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSections: any[];
    currentTerm: string;
    onLoadSchedule: (sections: any[]) => void;
}

const SavedScheduleModal: React.FC<SavedScheduleModalProps> = ({
    isOpen,
    onClose,
    currentSections,
    currentTerm,
    onLoadSchedule
}) => {
    const [activeTab, setActiveTab] = useState<'save' | 'load'>('save');
    const [scheduleName, setScheduleName] = useState('');
    const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSavedSchedules();
        }
    }, [isOpen]);

    const loadSavedSchedules = () => {
        const schedules = ScheduleStorage.getAllSchedules();
        setSavedSchedules(schedules);
    };

    const handleSaveSchedule = async () => {
        if (!scheduleName.trim()) {
            alert('Please enter a schedule name');
            return;
        }

        if (currentSections.length === 0) {
            alert('No courses selected to save');
            return;
        }

        setIsLoading(true);
        try {
            const savedSchedule = ScheduleStorage.saveSchedule(
                scheduleName.trim(),
                currentSections,
                currentTerm
            );

            setScheduleName('');
            loadSavedSchedules();
            setActiveTab('load');

        } catch (error) {
            console.error('Error saving schedule:', error);
            alert('Failed to save schedule. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadSchedule = (schedule: SavedSchedule) => {
        onLoadSchedule(schedule.sections);
        onClose();
    };

    const handleDeleteSchedule = (id: string, name: string) => {

        ScheduleStorage.deleteSchedule(id);
        loadSavedSchedules();

    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTerm = (term: string) => {
        if (term.length === 6) {
            const year = term.substring(0, 4);
            const semester = term.substring(4, 6);

            let semesterName = '';
            switch (semester) {
                case '10':
                    semesterName = 'Spring';
                    break;
                case '20':
                    semesterName = 'Summer';
                    break;
                case '30':
                    semesterName = 'Fall';
                    break;
                default:
                    semesterName = 'Unknown';
            }

            return `${semesterName} ${year}`;
        }
        return term;
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 w-full max-w-2xl max-h-[80vh] overflow-hidden transform transition-all duration-300 scale-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Saved Schedules
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-all duration-200"
                        >
                            <svg
                                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-zinc-700">
                        <button
                            onClick={() => setActiveTab('save')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-all duration-200 ${activeTab === 'save'
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Save Current Schedule
                        </button>
                        <button
                            onClick={() => setActiveTab('load')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-all duration-200 ${activeTab === 'load'
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Load Saved Schedule ({savedSchedules.length})
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-96">
                        {activeTab === 'save' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Schedule Name
                                    </label>
                                    <input
                                        type="text"
                                        value={scheduleName}
                                        onChange={(e) => setScheduleName(e.target.value)}
                                        placeholder="Enter a name for your schedule"
                                        className="w-full px-4 py-3 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveSchedule()}
                                    />
                                </div>

                                <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-xl p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        Current Schedule Summary
                                    </h4>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <p>Term: {formatTerm(currentTerm)}</p>
                                        <p>Courses: {currentSections.length} selected</p>
                                        {currentSections.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {currentSections.slice(0, 5).map((section, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md text-xs"
                                                    >
                                                        {section.courseCode}
                                                    </span>
                                                ))}
                                                {currentSections.length > 5 && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        +{currentSections.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveSchedule}
                                    disabled={isLoading || !scheduleName.trim() || currentSections.length === 0}
                                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-sm hover:shadow-md"
                                >
                                    {isLoading ? 'Saving...' : 'Save Schedule'}
                                </button>
                            </div>
                        )}

                        {activeTab === 'load' && (
                            <div className="space-y-4">
                                {savedSchedules.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 dark:text-gray-500 mb-2">
                                            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400">No saved schedules yet</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">Create your first schedule to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {savedSchedules.map((schedule) => (
                                            <div
                                                key={schedule.id}
                                                className="bg-gray-50 dark:bg-zinc-700/50 rounded-xl p-4 border border-gray-200 dark:border-zinc-600 hover:border-gray-300 dark:hover:border-zinc-500 transition-all duration-200"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                                            {schedule.name}
                                                        </h4>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                            <p>Term: {formatTerm(schedule.term)}</p>
                                                            <p>Courses: {schedule.sections.length}</p>
                                                            <p>Saved: {formatDate(schedule.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => handleLoadSchedule(schedule)}
                                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                                                        >
                                                            Load
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSchedule(schedule.id, schedule.name)}
                                                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SavedScheduleModal;
