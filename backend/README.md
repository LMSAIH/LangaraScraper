# Langara College Scraper 🎓

A comprehensive web scraper for Langara College (langara.ca) built with **Puppeteer** and **Cheerio**. This scraper provides detailed insights into what's happening on the Langara website by extracting news, programs, courses, events, and notices.

## Features ✨

- **📄 Main Page Scraping**: Extracts news, programs, events, and notices from the main Langara page
- **📚 Course Catalog**: Scrapes available courses with details like code, name, credits, and descriptions
- **🎓 Program Information**: Extracts featured programs with descriptions and credentials
- **📰 News & Announcements**: Gets the latest news and announcements
- **🗓️ Events**: Extracts upcoming events with dates and locations
- **⚠️ Important Notices**: Captures important alerts and notices
- **📊 Performance Metrics**: Provides page load times and performance data
- **📸 Screenshot Capture**: Takes screenshots for debugging and verification

## Technology Stack 🛠️

- **Puppeteer**: For browser automation and rendering JavaScript
- **Cheerio**: For HTML parsing and DOM manipulation
- **TypeScript**: For type safety and better development experience
- **Express.js**: For REST API endpoints
- **Axios**: For HTTP requests when needed

## Installation & Setup 🚀

1. **Install dependencies** (already installed in your project):
   ```bash
   npm install
   ```

2. **Required packages** (already in package.json):
   - puppeteer
   - cheerio
   - typescript
   - express
   - @types/node

## Usage 💻

### Option 1: Direct Testing
Run the test script to see the scraper in action:
```bash
npm run test-scraper
```

### Option 2: API Endpoints
Start the server and use the REST API:
```bash
npm run dev
```

Then access these endpoints:

| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /scraper/langara/status` | Check scraper status | Status and available endpoints |
| `GET /scraper/langara/scrape-main` | Scrape main Langara page | News, programs, events, notices |
| `GET /scraper/langara/scrape-courses` | Scrape course catalog | Course listings with details |
| `GET /scraper/langara/scrape-detailed` | Detailed scraping + metrics | Complete data + performance metrics |

### Option 3: Programmatic Usage
```typescript
import { LangaraScraper } from './scrapers/LangaraScraper';

// Quick scrape (automatically handles browser lifecycle)
const result = await LangaraScraper.quickScrape();
console.log('Scraped data:', result);

// Manual control (for multiple operations)
const scraper = new LangaraScraper();
try {
  const mainPage = await scraper.scrapeMainPage();
  const courses = await scraper.scrapeCoursesCatalog();
  const metrics = await scraper.getPageMetrics();
} finally {
  await scraper.close();
}
```

## Data Structure 📋

### Main Scraping Result
```typescript
interface LangaraScrapingResult {
  timestamp: string;
  pageInfo: LangaraPageInfo;
  news: LangaraNews[];
  featuredPrograms: LangaraProgram[];
  recentCourses: LangaraCourse[];
  notices: string[];
  events: LangaraEvent[];
}
```

### Course Information
```typescript
interface LangaraCourse {
  courseCode: string;      // e.g., "CPSC 1150"
  courseName: string;      // e.g., "Program Design"
  credits: string;         // e.g., "4.0"
  description: string;     // Course description
  prerequisites?: string;  // Prerequisites if available
  transferInfo?: string;   // Transfer information
}
```

### Program Information
```typescript
interface LangaraProgram {
  programName: string;     // e.g., "Computer Science Diploma"
  programCode: string;     // Program code
  description: string;     // Program description
  duration: string;        // e.g., "2 years"
  credential: string;      // e.g., "Diploma"
}
```

## What the Scraper Shows You 👀

The scraper provides insights into:

1. **📰 Latest News**: Current announcements and news items
2. **🎓 Featured Programs**: Highlighted academic programs
3. **📚 Course Information**: Available courses with details
4. **🗓️ Upcoming Events**: Campus events and important dates
5. **⚠️ Important Notices**: Alerts, deadlines, and urgent information
6. **📊 Performance Data**: Page load times and technical metrics
7. **📸 Visual Evidence**: Screenshots of the scraped pages

## Example Output 📋

```json
{
  "success": true,
  "message": "Langara main page scraped successfully",
  "data": {
    "timestamp": "2025-06-26T10:30:00.000Z",
    "pageInfo": {
      "title": "Langara College - Vancouver, BC",
      "url": "https://langara.ca",
      "description": "Langara College description...",
      "lastUpdated": "2025-06-26T10:30:00.000Z"
    },
    "news": [
      {
        "title": "Spring Registration Opens",
        "date": "June 25, 2025",
        "summary": "Registration for spring courses...",
        "link": "https://langara.ca/news/..."
      }
    ],
    "featuredPrograms": [...],
    "recentCourses": [...],
    "notices": [...],
    "events": [...]
  }
}
```

## Error Handling 🛡️

The scraper includes comprehensive error handling:
- Graceful browser management
- Timeout handling for slow page loads
- Fallback strategies for missing elements
- Detailed error logging
- Automatic cleanup of resources

## Performance Features ⚡

- **Headless browsing** for faster execution
- **Smart selectors** that adapt to page changes
- **Screenshot capture** for debugging
- **Performance metrics** collection
- **Memory management** with proper cleanup

## Development Tips 💡

1. **Testing**: Use `npm run test-scraper` to test functionality
2. **Debugging**: Screenshots are saved as `langara-screenshot.png`
3. **Customization**: Modify selectors in `LangaraScraper.ts` for different data
4. **Performance**: Monitor metrics returned by `getPageMetrics()`

## Troubleshooting 🔧

### Common Issues:
1. **Browser fails to start**: Check if all dependencies are installed
2. **Page won't load**: Check internet connection and langara.ca availability
3. **No data extracted**: Langara.ca may have changed their HTML structure
4. **Timeout errors**: Increase timeout values in scraper configuration

### Debug Mode:
Set `headless: false` in the Puppeteer configuration to see the browser in action:
```typescript
this.browser = await puppeteer.launch({
  headless: false,  // Change this to see the browser
  // ... other options
});
```

## API Response Examples 📝

### Status Check
```bash
curl http://localhost:3000/scraper/langara/status
```

### Main Page Scraping
```bash
curl http://localhost:3000/scraper/langara/scrape-main
```

### Course Catalog
```bash
curl http://localhost:3000/scraper/langara/scrape-courses
```

### Detailed Analysis
```bash
curl http://localhost:3000/scraper/langara/scrape-detailed
```

## Contributing 🤝

Feel free to improve the scraper by:
- Adding new data extraction features
- Improving error handling
- Optimizing performance
- Adding more comprehensive testing

---

**Happy Scraping! 🕷️📊**
