import { Router } from "express";
import { handleGetProfessors } from "../../Controllers/ProfessorsController";

const router = Router();

router.get("/", handleGetProfessors);

export { router };