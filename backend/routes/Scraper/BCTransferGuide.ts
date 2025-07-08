import { Router, Request, Response } from "express";
//import { getTransfersForInstitution } from "../../Controllers/BCTransferGuideController";
import { handleGetUniqueCourseTransfer } from "../../Controllers/BCTransferGuideController";

const router = Router();

router.post("/getAgreements", handleGetUniqueCourseTransfer);

export { router };
