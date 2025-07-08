# Langara Course Attribute Scraper

A fast and efficient Node.js scraper for Langara College course attributes and descriptions.

## Features

- ✅ **Dynamic Column Detection**: Automatically reads attribute column headers (2AR, 2SC, HUM, etc.)
- ✅ **Course Description Scraping**: Fetches course descriptions from individual course pages
- ✅ **Concurrent Processing**: Uses throttled concurrency for optimal performance
- ✅ **Database Integration**: Stores data in MongoDB with proper indexing
- ✅ **Error Handling**: Robust error handling with detailed logging
- ✅ **Periodic Execution**: Designed for weekly/bi-weekly updates
- ✅ **TypeScript**: Fully typed with interfaces and proper error handling

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set up Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/langara-scraper
```

### 3. Run the Scraper

```bash
# Run with default settings (current year, Fall semester)
npx ts-node scripts/run-course-scraper.ts

# Run with custom parameters
npx ts-node scripts/run-course-scraper.ts 2024 1 Fall
```

## API Endpoints

### Trigger Scraping

```http
POST /api/scraper/course-attributes/scrape
Content-Type: application/json

{
  "year": 2024,
  "semester": 1,
  "term": "Fall"
}
```

### Get Statistics

```http
GET /api/scraper/course-attributes/stats
```

### Query Courses

#### By Attribute

```http
GET /api/scraper/course-attributes/by-attribute/2AR?year=2024&semester=1
```

#### By Subject

```http
GET /api/scraper/course-attributes/by-subject/ENGL?year=2024&semester=1
```

#### By Course Code

```http
GET /api/scraper/course-attributes/by-code/ENGL%201123?year=2024&semester=1
```

#### By Term

```http
GET /api/scraper/course-attributes/by-term?year=2024&semester=1
```

## Data Structure

### Course Interface

```typescript
interface Course {
  courseCode: string; // e.g., "ENGL 1123"
  subject: string; // e.g., "ENGL"
  description?: string; // Course description (optional)
  attributes: string[]; // e.g., ["2AR", "HUM"]
}
```

### Database Schema

```typescript
interface ICourseAttribute extends Document {
  courseCode: string;
  subject: string;
  description?: string;
  attributes: string[];
  term: string;
  year: number;
  semester: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Performance Features

### Concurrency Control

- **Default**: 5 concurrent requests for course descriptions
- **Configurable**: Adjust `CONFIG.concurrency` in `CourseAttributeScraper.ts`
- **Throttled**: 100ms delay between batches to be respectful to the server

### Database Indexing

- **Primary**: `{ courseCode: 1, term: 1 }` (unique)
- **Secondary**: `{ subject: 1, year: 1, semester: 1 }`
- **Attribute**: `{ attributes: 1, year: 1, semester: 1 }`

### Error Handling

- **Graceful Degradation**: Continues processing even if some courses fail
- **Detailed Logging**: Comprehensive error reporting
- **Retry Logic**: Built-in retry mechanisms for transient failures

## Configuration

### Scraper Settings

Edit `CONFIG` object in `CourseAttributeScraper.ts`:

```typescript
const CONFIG = {
  baseUrl: 'https://swing.langara.bc.ca/prod/hzgkcald.P_DispCrseAttr',
  courseDescriptionBaseUrl:
    'https://swing.langara.bc.ca/prod/hzgkcald.P_ShowCatalog',
  userAgent: 'Mozilla/5.0...',
  concurrency: 5, // Concurrent requests
  delay: 100, // Delay between batches (ms)
};
```

### Database Settings

- **Connection**: Configure via `MONGODB_URI` environment variable
- **Indexes**: Automatically created on first run
- **Cleanup**: Optional cleanup of old data via API endpoint

## Usage Examples

### Programmatic Usage

```typescript
import { CourseAttributeController } from './Controllers/CourseAttributeController';

// Scrape and save courses
const stats = await CourseAttributeController.scrapeAndSaveCourses(
  2024,
  1,
  'Fall'
);

// Query courses by attribute
const courses = await CourseAttributeController.getCoursesByAttribute(
  '2AR',
  2024,
  1
);

// Get scraping statistics
const dbStats = await CourseAttributeController.getScrapingStats();
```

### Scheduled Execution

Add to your cron job or scheduler:

```bash
# Run weekly on Sundays at 2 AM
0 2 * * 0 cd /path/to/backend && npx ts-node scripts/run-course-scraper.ts
```

## Monitoring

### Logs

The scraper provides detailed console output:

- 🚀 Progress indicators
- 📊 Statistics and counts
- ❌ Error details
- ⏱️ Performance metrics

### Metrics

Track these key metrics:

- **Total courses processed**
- **Courses with descriptions**
- **Processing duration**
- **Error count**

## Troubleshooting

### Common Issues

1. **Connection Timeout**

   - Increase timeout values in axios config
   - Check network connectivity

2. **Rate Limiting**

   - Reduce `CONFIG.concurrency`
   - Increase `CONFIG.delay`

3. **Database Connection**

   - Verify `MONGODB_URI` is correct
   - Check MongoDB server status

4. **Missing Descriptions**
   - Some courses may not have descriptions
   - Check course page structure for changes

### Debug Mode

Enable detailed logging by modifying the scraper:

```typescript
// Add to CourseAttributeScraper.ts
const DEBUG = process.env.DEBUG === 'true';
if (DEBUG) {
  console.log('Debug: Raw HTML response:', response.data.substring(0, 500));
}
```

## Maintenance

### Data Cleanup

```http
DELETE /api/scraper/course-attributes/clean?olderThanDays=365
```

### Health Check

```http
GET /api/scraper/course-attributes/stats
```

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include tests for new features
4. Update documentation

## License

This project is part of the LangaraScraper system.
