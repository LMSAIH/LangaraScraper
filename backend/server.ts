import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import {router as CourseRoutes} from "./routes/Client/CourseRoutes";
import {router as BCTGRouter} from "./routes/Scraper/BCTransferGuide";
import {router as ScraperCourseRoutes} from "./routes/Scraper/Courses";
import {CourseScheduler} from "./Schedulers/CourseScheduler"; 
import morgan from "morgan";
import responseTime from "response-time";
import connectDB from "./Database/db";

const app = express();

connectDB();

app.use(responseTime((req: Request, res: Response, time: number) => {
    console.log(`⏱️  ${req.method} ${req.url} - ${time.toFixed(2)}ms`);
}));

app.use(morgan(':method :url :status STATUS - :response-time ms'));

app.use(express.json());
app.use(cors());

app.use("/courses", CourseRoutes);

//Comment this routes before deployment, they are only for testing purposes and will all run on scheduled tasks

app.use("/scraper/BCTG", BCTGRouter);
app.use("/scraper/", ScraperCourseRoutes);

const scheduler = CourseScheduler.getInstance();

app.listen(3000, () => {
  scheduler.start();
  console.log("Server is running on http://localhost:3000");
});

process.on('SIGINT', () => {
  console.log('Shutting down scraper gracefully...');
  scheduler.stop();
});