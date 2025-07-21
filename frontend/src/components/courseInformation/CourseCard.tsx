import { Link } from 'react-router-dom';
import { FaBook, FaTags, FaAlignLeft } from 'react-icons/fa';

interface Course {
    courseCode: string;
    title?: string;
    description?: string;
    attributes: string[];
}

interface CourseCardProps {
    course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
    return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Course Code */}
                    <div className="flex items-center mb-2">
                        <FaBook className="text-blue-600 dark:text-blue-400 mr-2" />
                        <Link 
                            to={`/courses/${course.courseCode}`}
                            className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                            {course.courseCode}
                        </Link>
                    </div>
                    
                    {/* Course Title */}
                    {course.title && (
                        <h4 className="text-md text-gray-700 dark:text-gray-300 font-medium mb-3">
                            {course.title}
                        </h4>
                    )}

                    {/* Course Description */}
                    {course.description && (
                        <div className="mb-4">
                            <div className="flex items-start mb-2">
                                <FaAlignLeft className="text-gray-400 dark:text-gray-500 mr-2 mt-1 flex-shrink-0" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                                    {course.description}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {/* Course Attributes */}
                    {course.attributes && course.attributes.length > 0 && (
                        <div className="flex items-start">
                            <FaTags className="text-blue-600 dark:text-blue-400 mr-2 mt-1 flex-shrink-0" />
                            <div className="flex flex-wrap gap-2">
                                {course.attributes.map((attr, index) => (
                                    <span 
                                        key={index} 
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                                    >
                                        {attr}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
