import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import {router as CourseRoutes} from "./routes/Client/CourseRoutes";
import {router as BCTGRouter} from "./routes/Scraper/BCTransferGuide";


const app = express();

app.use(express.json());
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

app.use("/courses", CourseRoutes);
app.use("/scraper/BCTG", BCTGRouter);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
