import React from 'react';

interface StatusLegendModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const StatusLegendModal: React.FC<StatusLegendModalProps> = ({ isOpen, onClose }) => {
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
                    className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 w-full max-w-4xl max-h-[90vh] transform transition-all duration-300 scale-100 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - Fixed */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            How to Use LangaraScraper
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

                    {/* Content - Scrollable */}
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* What it does */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                        What is LangaraScraper?
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        A modern course registration tool that helps you search, filter, and schedule
                                        Langara College courses with an intuitive calendar view.
                                    </p>
                                </div>

                                {/* How to use */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        How to Use
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                                                1
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Use filters to search by term, subject, course code, or instructor
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                                                2
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Click on any course to add it to your schedule
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                                                3
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                View your schedule in the calendar to check for conflicts
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                                                4
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400 flex items-start gap-2 relative">
                                                Save your schedule using the load/save button in the top right of the search filters
                                                <div className=" w-8 h-8  text-white rounded-md">
                                                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Status */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Course Status
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-gray-600 dark:text-gray-400">Available - Course is open for registration</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <span className="text-gray-600 dark:text-gray-400">Online/TBA - Online course or time/location TBA</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="text-gray-600 dark:text-gray-400">Cancelled - Course has been cancelled</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Save & Load Schedules */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Save & Load Schedules
                                    </h3>
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <p className="mb-2">Manage your course schedules with ease:</p>
                                            <ul className="space-y-1 text-sm">
                                                <li>• Save multiple schedules to your browser for easy access</li>
                                                <li>• Load previously saved schedules to quickly switch between options</li>
                                                <li>• Organize schedules by name and term for better planning</li>
                                                <li>• Compare different schedule variations side by side</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Tips */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                    <h4 className="text-blue-900 dark:text-blue-100 font-medium mb-2">
                                        Pro Tips
                                    </h4>
                                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                        <li>• Hover over courses to preview them in the calendar</li>
                                        <li>• Use the dark mode toggle in the top right</li>
                                        <li>• Click added courses again to remove them</li>
                                        <li>• Save multiple schedule variations to compare options</li>
                                        <li>• Schedules are saved locally in your browser</li>
                                    </ul>
                                </div>

                                {/* Additional Features */}
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                                    <h4 className="text-green-900 dark:text-green-100 font-medium mb-2">
                                        Key Features
                                    </h4>
                                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                                        <li>• Real-time course availability</li>
                                        <li>• Conflict detection in calendar view</li>
                                        <li>• Multiple schedule comparison</li>
                                        <li>• Mobile-responsive design</li>
                                        <li>• Dark/light mode support</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StatusLegendModal;