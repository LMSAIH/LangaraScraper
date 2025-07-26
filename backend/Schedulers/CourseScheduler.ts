import * as cron from "node-cron";
import { handleGetCourses, handleGetCourseInfo } from "../Controllers/CourseScraper";

class CourseScheduler {
  private static instance: CourseScheduler;
  private task: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): CourseScheduler {
    if (!CourseScheduler.instance) {
      CourseScheduler.instance = new CourseScheduler();
    }
    return CourseScheduler.instance;
  }

  public start(): void {
    if (this.task) {
      console.log('Course scheduler is already running');
      return;
    }

    // Define the scraper function to avoid duplication
    const runScraper = async () => {
      // Prevent multiple scraper instances running simultaneously
      if (this.isRunning) {
        console.log(`[${new Date().toISOString()}] ⚠️ Scraper already running, skipping this run`);
        return;
      }

      try {
        this.isRunning = true;
        console.log(`[${new Date().toISOString()}] 🚀 Starting scheduled course scraper...`);
        
        const nextSemester = this.getNextSemester();
        console.log(`[${new Date().toISOString()}] 📅 Scraping next semester: ${nextSemester.year}-${nextSemester.semester}`);
        
        const mockReq = {
          body: {
            year: nextSemester.year,
            semester: nextSemester.semester,
            saveToDb: true  
          },
          query: {},
          params: {}
        } as any;

        const mockRes = {
          json: (data: any) => {
            const timestamp = new Date().toISOString();
            if (data.success) {
              console.log(`[${timestamp}] ✅ Scheduled scraper completed successfully`);
              if (data.coursesScraped) {
                console.log(`[${timestamp}] 📊 Scraped ${data.coursesScraped} courses for ${nextSemester.year}-${nextSemester.semester}`);
              }
            } else {
              console.log(`[${timestamp}] ❌ Scheduled scraper failed:`, data.error);
            }
          },
          status: (code: number) => ({
            json: (data: any) => {
              const timestamp = new Date().toISOString();
              console.log(`[${timestamp}] ❌ Scheduled scraper failed with status ${code}:`, data);
            }
          })
        } as any;

        await handleGetCourses(mockReq, mockRes);
        
      } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ❌ Error in scheduled course scraper:`, error);
      } finally {
        this.isRunning = false;
        console.log(`[${new Date().toISOString()}] 🏁 Scraper run completed`);
      }
    };

    // Run immediately on start
    runScraper();

    // Schedule to run every hour
    this.task = cron.schedule('0 * * * *', runScraper, {
      timezone: "America/Vancouver"
    });

    console.log('Course scheduler started - will run every hour and scrape next semester');
  }

  public stop(): void {
    if (this.task) {
      this.task.stop();
      this.task.destroy();
      this.task = null;
      console.log('Course scheduler stopped');
    }
    
    // Reset running state
    this.isRunning = false;
  }

  public isSchedulerRunning(): boolean {
    return this.task !== null;
  }

  public isScraperCurrentlyRunning(): boolean {
    return this.isRunning;
  }

  private getCurrentSemester(): number {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 1 && month <= 4) return 10; // Winter
    if (month >= 5 && month <= 8) return 20; // Summer  
    return 30; // Fall
  }

  private getNextSemester(): { year: number, semester: number } {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-12
    
    // Determine next semester based on current month
    if (month >= 1 && month <= 4) {
        // Currently Winter -> next is Summer (same year)
        return { year: currentYear, semester: 20 };
    } else if (month >= 5 && month <= 8) {
        // Currently Summer -> next is Fall (same year)
        return { year: currentYear, semester: 30 };
    } else {
        // Currently Fall -> next is Winter (next year)
        return { year: currentYear + 1, semester: 10 };
    }
}
}

class CourseInfoScheduler {
  private static instance: CourseInfoScheduler;
  private task: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): CourseInfoScheduler {
    if (!CourseInfoScheduler.instance) {
      CourseInfoScheduler.instance = new CourseInfoScheduler();
    }
    return CourseInfoScheduler.instance;
  }

  public start(): void {
    if (this.task) {
      console.log('Course info scheduler is already running');
      return;
    }

    const runScraper = async () => {
      if (this.isRunning) {
        console.log('Course info scheduler is already running');
        return;
      }

      try {
        this.isRunning = true;
        console.log(`[${new Date().toISOString()}] 🚀 Starting scheduled course info scraper...`);
        const mockReq = {
          query: {
            startYear: new Date().getFullYear() - 2,
            saveToDb: true
          }
        } as any;

        const mockRes = {
          json: (data: any) => {
            console.log(`[${new Date().toISOString()}] Course info scraper completed successfully`);
          }
        } as any;

        await handleGetCourseInfo(mockReq, mockRes);

      } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}]  Error in scheduled course info scraper:`, error);
      } finally {
        this.isRunning = false;
        console.log(`[${new Date().toISOString()}] 🏁 Course info scraper run completed`);
      }
    }

    // Run immediately on start
    runScraper();

    // Schedule to run every week
    this.task = cron.schedule('0 2 * * 0', runScraper, {
      timezone: "America/Vancouver"
    });
  }

  public stop(): void {
    if (this.task) {
      this.task.stop();
      this.task.destroy();
      this.task = null;
      console.log('Course info scheduler stopped');
    }
    
    // Reset running state
    this.isRunning = false;
  }

  public isSchedulerRunning(): boolean {
    return this.task !== null;
  }

  public isScraperCurrentlyRunning(): boolean {
    return this.isRunning;
  }
}
export { CourseScheduler, CourseInfoScheduler };