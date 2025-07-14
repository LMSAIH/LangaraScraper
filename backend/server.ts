import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { router as CourseRoutes } from "./routes/Client/CourseRoutes";
import { router as BCTGRouter } from "./routes/Scraper/BCTransferGuide";
import { router as ScraperCourseRoutes } from "./routes/Scraper/Courses";
import { CourseScheduler } from "./Schedulers/CourseScheduler";
import { generalLimiter } from "./RateLimiting/RateLimiters";
import morgan from "morgan";
import responseTime from "response-time";
import connectDB from "./Database/db";
import { Server } from "http";

const app = express();

let scheduler: CourseScheduler | null = null;
let isShuttingDown = false;
let server: Server | null = null; // Add server reference

const initializeApp = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");

    // Only start scheduler if not already running
    if (!scheduler) {
      scheduler = CourseScheduler.getInstance();
      scheduler.start();
      console.log("Course scheduler started");
    } else if (!scheduler.isSchedulerRunning()) {
      scheduler.start();
      console.log("Course scheduler restarted");
    } else {
      console.log("Course scheduler already running");
    }
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

// Setup graceful shutdown once
const shutdown = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("Shutting down server gracefully...");

  // Stop the scheduler
  if (scheduler) {
    scheduler.stop();
    scheduler = null;
  }

  // Close the HTTP server
  if (server) {
    server.close((err) => {
      if (err) {
        console.error("Error closing server:", err);
        process.exit(1);
      } else {
        console.log("Server closed successfully");
        process.exit(0);
      }
    });
  } else {
    process.exit(0);
  }
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

app.use(generalLimiter);

app.use(
  responseTime((req: Request, res: Response, time: number) => {
    console.log(`⏱️  ${req.method} ${req.url} - ${time.toFixed(2)}ms`);
  })
);

app.use(morgan(":method :url :status STATUS - :response-time ms"));

app.use(express.json());
app.use(cors());

app.use("/courses", CourseRoutes);
//Comment this routes before deployment, they are only for testing purposes and will all run on scheduled tasks
app.use("/scraper/BCTG", BCTGRouter);
app.use("/scraper/", ScraperCourseRoutes);

// Capture the server instance
server = app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  initializeApp();
});

// Handle server errors
server.on("error", (error) => {
  console.error("Server error:", error);
});
