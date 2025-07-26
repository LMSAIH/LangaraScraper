import { Router } from "express";
import { handleGetCollegeInfo, handleScrapeProfessors } from "../../Controllers/RateMyProfController";

const router = Router();

router.get("/getCollegeInfo", handleGetCollegeInfo);
router.post("/professors", handleScrapeProfessors);

export { router };
