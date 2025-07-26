import { Request, Response } from "express";
import { Professor } from "../Models/Professor";

// Get professors from database with filtering and sorting
export const handleGetProfessors = async (req: Request, res: Response) => {
  try {
    const { department, minRating, name, sortBy = 'avg_rating', sortOrder = 'desc' } = req.query;

    // Build filter object
    const filter: any = {};
    if (department) {
      filter.department = new RegExp(department as string, 'i');
    }
    if (minRating) {
      filter.avg_rating = { $gte: parseFloat(minRating as string) };
    }
    if (name) {
      filter.name = { $regex: new RegExp(name as string, "i") }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const professors = await Professor.find(filter).sort(sort);
    
    res.json({
      success: true,
      count: professors.length,
      professors: professors
    });
  } catch (error) {
    console.error("Error retrieving professors:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve professors",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
