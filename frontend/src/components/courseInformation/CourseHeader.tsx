interface CourseHeaderProps {
    totalCourses: number;
}

const CourseHeader = ({ totalCourses }: CourseHeaderProps) => {
    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Course Catalog
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Browsing {totalCourses} courses
            </p>
        </div>
    );
};

export default CourseHeader;
