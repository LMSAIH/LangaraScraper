import { Router, Request, Response } from "express";
import { getBCTransferSubjectIDs } from "../../Controllers/BCTransferGuideController";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {

  try {

    if (!req.body || !req.body.institutionID) {
      res.status(400).json({ error: "Institution ID is required" });
      return;
    }

    const institutionID = req.body.institutionID;

    console.log(typeof institutionID, institutionID);

    const subjects = await getBCTransferSubjectIDs(institutionID);
    console.log(subjects);

    res.json(subjects);
    
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).send("Internal Server Error");
  }

});

export { router };
