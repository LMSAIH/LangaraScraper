import * as cron from "node-cron";
import { handleGetCourses } from "../Controllers/CourseScraper";

export class CourseScheduler {
  private static instance: CourseScheduler;
  private task: cron.ScheduledTask | null = null;

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

    // Run every hour
    this.task = cron.schedule('0 * * * *', async () => {
      try {
        console.log(`[${new Date().toISOString()}] Running scheduled course scraper...`);
        
        const mockReq = {
          body: {
            // Add any default parameters your scraper needs
            year: new Date().getFullYear(),
            semester: this.getCurrentSemester()
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
                console.log(`[${timestamp}] 📚 Scraped ${data.coursesScraped} courses`);
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
        console.error(`[${timestamp}] 💥 Error in scheduled course scraper:`, error);
      }
    }, {
      timezone: "America/Vancouver"
    });

  }

  public stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('⏹️ Course scheduler stopped');
    }
  }

  private getCurrentSemester(): number {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 1 && month <= 4) return 10; // Winter
    if (month >= 5 && month <= 8) return 20; // Summer  
    return 30; // Fall
  }
}