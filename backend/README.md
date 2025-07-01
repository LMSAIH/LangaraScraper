# Langara Course Scraper API 🎓

A comprehensive Node.js/Express API for scraping and managing Langara College course data. This backend provides course information, sections, meeting times, and instructor details through a robust REST API with MongoDB storage.

## Features ✨

- **� Course Scraping**: Scrapes course data from Langara's official course catalog
- **�️ Database Storage**: Stores course data in MongoDB with optimized schema
- **🔍 Advanced Filtering**: Filter courses by subject, instructor, availability, semester, etc.
- **📊 Structured Data**: Flattened database structure for optimal performance
- **🔗 REST API**: Comprehensive endpoints for accessing course data
- **⚡ Smart Parsing**: Handles multiple meeting times per section (Lecture + Lab)
- **🎯 BC Transfer Guide**: Integration with BC Transfer Guide data

## Technology Stack 🛠️

- **Node.js** + **Express.js**: REST API server
- **TypeScript**: Type safety and better development experience
- **MongoDB** + **Mongoose**: Database and ODM
- **Axios**: HTTP requests for scraping
- **Cheerio**: HTML parsing and DOM manipulation

## Database Schema 📊

The system uses a **flattened structure** with three main collections:

### CourseData Collection
```typescript
interface CourseData {
  courseCode: string;    // "CPSC 1030"
  subject: string;       // "CPSC"
  term: string;          // "202530"
  year: number;          // 2025
  semester: number;      // 30
}
```

### CourseSection Collection
```typescript
interface CourseSection {
  courseCode: string;    // Reference to CourseData
  crn: string;          // "30123"
  subject: string;      // "CPSC"
  course: string;       // "1030"
  section: string;      // "001"
  credits: string;      // "3"
  title: string;        // "Computer Fundamentals"
  seatsAvailable: string;
  waitlist: string;
  additionalFees: string;
  repeatLimit: string;
  notes?: string;
  term: string;
  year: number;
  semester: number;
}
```

### MeetingTime Collection
```typescript
interface MeetingTime {
  sectionCRN: string;   // Reference to CourseSection
  sectionType: string;  // "Lecture", "Lab", "Tutorial"
  days: string;         // "MWF", "T-R"
  time: string;         // "1030-1220"
  room: string;         // "A275"
  instructor: string;   // "John Smith"
  term: string;
  year: number;
  semester: number;
}
```

## Installation & Setup 🚀

1. **Clone and install dependencies**:
   ```bash
   git clone <repository>
   cd backend
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/langara_courses
   PORT=3000
   NODE_ENV=development
   ```

3. **Start MongoDB**:
   ```bash
   # Using MongoDB locally
   mongod

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Run the server**:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## API Endpoints 🔗

### Course Scraping Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/scraper/subjects` | Get available subjects for a term |
| `POST` | `/api/scraper/courses` | Scrape course data for a term |


#### Scrape Courses
```bash
POST /api/scraper/courses
Content-Type: application/json

{
  "year": 2025,
  "semester": 30
}
```

### Course Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/courses` | Get all courses with pagination |
| `GET` | `/api/courses/:courseCode` | Get specific course info |
| `GET` | `/api/courses/:courseCode/full` | Get course with sections and meeting times |
| `GET` | `/api/courses/:courseCode/sections` | Get sections for a course |
| `GET` | `/api/courses/:courseCode/sections-full` | Get sections with meeting times |

### Section Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/courses/sections/all` | Get all sections with filtering |
| `GET` | `/api/courses/sections/:crn/meetings` | Get meeting times for a section |

### Meeting Time Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/courses/meetings/all` | Get all meeting times with filtering |

### Aggregated Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/courses/sections/meetings/all` | Get courses with sections and meeting times |

### Metadata Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/courses/meta/subjects` | Get all available subjects |
| `GET` | `/api/courses/meta/instructors` | Get all instructors |

## Query Parameters 🔍

### Common Filters
- `year` - Academic year (e.g., 2025)
- `semester` - Semester code (e.g., 30 for Spring)
- `subject` - Subject code (e.g., CPSC, MATH)
- `courseCode` - Full course code (e.g., "CPSC 1030")
- `instructor` - Instructor name (supports partial matching)
- `available` - Show only available sections (`true`/`false`)
- `limit` - Results per page (default: 100)
- `page` - Page number (default: 1)

### Examples

```bash
# Get all CPSC courses for Spring 2025
GET /api/courses?subject=CPSC&year=2025&semester=30

# Get available sections taught by John Smith
GET /api/courses/sections/all?instructor=John%20Smith&available=true

# Get all meeting times for a specific instructor
GET /api/courses/meetings/all?instructor=Johnson&year=2025&semester=30

# Get complete course data with sections and meeting times
GET /api/courses/CPSC%1181/sections-full?year=2025&semester=30
```

## Response Format 📋

### Standard Response Structure
```json
{
  "success": true,
  "data": [...],
  "count": 25,
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 150,
    "totalPages": 2
  },
  "filters": {
    "year": 2025,
    "semester": 30,
    "subject": "CPSC"
  },
  "timestamp": "2025-06-30T10:30:00.000Z"
}
```

### Course with Sections and Meeting Times
```json
{
  "success": true,
  "courseCode": "CPSC 1030",
  "sections": [
    {
      "crn": "30123",
      "section": "001",
      "title": "Computer Fundamentals",
      "seatsAvailable": "5",
      "meetingTimes": [
        {
          "sectionType": "Lecture",
          "days": "MWF",
          "time": "1030-1220",
          "room": "A275",
          "instructor": "John Smith"
        },
        {
          "sectionType": "Lab",
          "days": "T",
          "time": "1430-1620",
          "room": "B019",
          "instructor": "John Smith"
        }
      ]
    }
  ]
}
```

## Project Structure �

```
backend/
├── Controllers/           # Request handlers
│   ├── CourseScraper.ts  # Course scraping logic
│   └── BCTransferGuideController.ts
├── Models/               # Mongoose schemas
│   ├── CourseData.ts    # Course metadata
│   ├── CourseSection.ts # Section details
│   └── MeetingTime.ts   # Meeting time data
├── Routes/              # API routes
│   ├── Client/
│   │   └── CourseRoutes.ts
│   └── Scraper/
│       ├── Courses.ts
│       └── BCTransferGuide.ts
├── Types/               # TypeScript interfaces
│   └── ScraperTypes.ts
├── Utils/               # Utility functions
│   └── Scraper/
│       └── ScraperUtils.ts
├── Database/            # Database connection
│   └── db.ts
└── server.ts           # Express server setup
```

## Scraping Process �️

The scraper works in three phases:

1. **Subject Discovery**: Gets all available subjects for a term
2. **Course Scraping**: Scrapes course data using form submission
3. **Data Parsing**: Parses HTML and structures data into collections

### Scraping Flow
```typescript
// 1. Get subjects
const subjects = await getSubjects(2025, 30);

// 2. Scrape courses
const coursesHtml = await getCourses(2025, 30, subjects);

// 3. Parse and structure data
const courseData = parseCourseData(coursesHtml);

// 4. Save to database (3 collections)
await saveCourseData(courseData);
```

## Advanced Features 🎯

### Multiple Meeting Times
Handles courses with multiple components:
- **CPSC 1030**: Lecture (MWF) + Lab (T)
- **CHEM 1110**: Lecture (TR) + Lab (W)

### Smart Instructor Filtering
```bash
# Find all courses taught by instructors with "Smith" in their name
GET /api/courses/sections/meetings/all?instructor=Smith

# Case-insensitive partial matching
GET /api/courses/meetings/all?instructor=john
```

### Pagination and Performance
- Efficient MongoDB queries with indexes
- Pagination for large datasets
- Aggregation pipelines for complex queries

## Development 💻

### Running Tests
```bash
npm test
```

### Database Management
```bash
# Drop old indexes (if schema changes)
use langara_courses;
db.coursedatas.dropIndexes();
db.coursesections.dropIndexes();
db.meetingtimes.dropIndexes();
```

### Environment Variables
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/langara_courses
```

## Error Handling 🛡️

The API includes comprehensive error handling:
- **Validation errors**: Invalid parameters return 400
- **Not found errors**: Missing resources return 404
- **Server errors**: Internal errors return 500
- **Database errors**: Connection issues are handled gracefully

## Performance Optimization ⚡

- **Indexed queries**: All commonly filtered fields are indexed
- **Lean queries**: Uses `.lean()` for faster JSON responses
- **Aggregation**: Complex queries use MongoDB aggregation
- **Pagination**: Large datasets are paginated

## Monitoring & Logging 📊

Response includes timing and metadata:
```json
{
  "success": true,
  "data": [...],
  "count": 25,
  "timestamp": "2025-06-30T10:30:00.000Z",
  "executionTime": "150ms"
}
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Happy Course Hunting! 🎓�**
