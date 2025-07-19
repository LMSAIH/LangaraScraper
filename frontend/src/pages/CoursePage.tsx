import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaBook, FaTags, FaClock, FaExclamationCircle } from 'react-icons/fa';

interface CourseInfo {
  courseCode: string;
  title: string;
  description?: string;
  attributes?: string[];
  updatedAt: string;
}

const CoursePage = () => {
  const { courseCode } = useParams<{ courseCode: string }>();
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!courseCode) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`http://localhost:3000/courses/courseInfo/${courseCode}`);
        setCourseInfo(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setError('Course information not found');
          } else {
            setError('Failed to load course information');
          }
        } else {
          setError('An unexpected error occurred');
        }
        console.error('Error fetching course info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseInfo();
  }, [courseCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading course information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaExclamationCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="h-4 w-4" />
            Back to Scheduler
          </Link>
        </div>
      </div>
    );
  }

  if (!courseInfo) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-4"
          >
            <FaArrowLeft className="h-4 w-4" />
            Back to Registration
          </Link>
          
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaBook className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {courseInfo.courseCode}
              </h1>
            </div>
            
            {courseInfo.title && (
              <h2 className="text-xl text-gray-700 dark:text-gray-300 font-medium mb-4">
                {courseInfo.title}
              </h2>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FaClock className="h-4 w-4" />
              <span>Last updated: {formatDate(courseInfo.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Course Description */}
        {courseInfo.description && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Course Description
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {courseInfo.description}
              </p>
            </div>
          </div>
        )}

        {/* Course Attributes */}
        {courseInfo.attributes && courseInfo.attributes.length > 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaTags className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Course Attributes
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {courseInfo.attributes.map((attribute, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                >
                  {attribute}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* No additional info message */}
        {!courseInfo.description && (!courseInfo.attributes || courseInfo.attributes.length === 0) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
            <p className="text-yellow-800 dark:text-yellow-300">
              Additional course information is not yet available for this course.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePage;