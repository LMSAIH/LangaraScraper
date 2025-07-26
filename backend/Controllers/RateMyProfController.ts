import { Request, Response } from "express";
import { RateMyProfessor } from "rate-my-professor-api-ts";
import { Professor } from "../Models/Professor";

// Get college info from Rate My Professor
export const handleGetCollegeInfo = async (req: Request, res: Response) => {
  try {
    const rmp_instance = new RateMyProfessor("Langara College");
    const college_info = await rmp_instance.get_college_info(false);

    res.json(college_info);
  } catch (error) {
    console.error("Error fetching college info:", error);
    res.status(500).json({ error: "Failed to fetch college info" });
  }
};

// Scrape professors from Rate My Professor and optionally save to database
export const handleScrapeProfessors = async (req: Request, res: Response) => {
  try {
    const { saveToDb = false } = req.body;
    
    const rmp_instance = new RateMyProfessor("Langara College");
    const professors = await rmp_instance.get_professor_list();

    if (saveToDb) {
      // Clear existing professors data
      await Professor.deleteMany({});
      
      // Save new professors data
      const professorsToSave = professors.map((prof: any) => ({
        name: prof.name,
        department: prof.department,
        avg_rating: prof.avg_rating,
        avg_difficulty: prof.avg_difficulty,
        num_ratings: prof.num_ratings,
        would_take_again_percent: prof.would_take_again_percent
      }));

      const savedProfessors = await Professor.insertMany(professorsToSave);
      
      res.json({
        success: true,
        message: `Successfully saved ${savedProfessors.length} professors to database`,
        count: savedProfessors.length,
        professors: savedProfessors
      });
    } else {
      res.json({
        success: true,
        message: "Professors fetched successfully (not saved to database)",
        count: professors.length,
        professors: professors
      });
    }
  } catch (error) {
    console.error("Error fetching/saving professors:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch/save professors",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
