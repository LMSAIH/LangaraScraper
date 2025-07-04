import { Request, Response } from 'express';
import { MeetingTime } from '../../Models/MeetingTime';

const handleGetAllMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      year, 
      semester, 
      sectionCRN,
      instructor,
      sectionType,
      days,
      limit = 100, 
      page = 1 
    } = req.query;

    if (!year || !semester) {
      res.status(400).json({
        success: false,
        error: "Year and semester are required",
      });
      return;
    }

    // Build query
    const query: any = {};
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (sectionCRN) query.sectionCRN = String(sectionCRN);
    if (instructor) query.instructor = new RegExp(String(instructor), 'i');
    if (sectionType) query.sectionType = String(sectionType);
    if (days) query.days = new RegExp(String(days), 'i');

    // Pagination
    const limitNum = Number(limit);
    const skip = (Number(page) - 1) * limitNum;

    // Get meeting times
    const meetingTimes = await MeetingTime.find(query)
      .limit(limitNum)
      .skip(skip)
      .sort({ sectionCRN: 1, sectionType: 1 })
      .lean();

    const totalCount = await MeetingTime.countDocuments(query);

    res.json({
      success: true,
      meetingTimes,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching meeting times:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


const handleGetMeetingTimesBySectionCRN = async (req: Request, res: Response): Promise<void> => {
    try {
      const { crn } = req.params;
      const { year, semester } = req.query;

      if (!crn) {
        res.status(400).json({
          success: false,
          error: "CRN is required",
        });
        return;
      }

      if (!year || !semester) {
        res.status(400).json({
          success: false,
          error: "Year and semester are required",
        });
        return;
      }

      const query: any = { sectionCRN: crn };
      if (year) query.year = Number(year);
      if (semester) query.semester = Number(semester);

      const meetingTimes = await MeetingTime.find(query)
        .sort({ sectionType: 1 })
        .lean();

      if (meetingTimes.length === 0) {
        res.status(404).json({
          success: false,
          error: `No meeting times found for section CRN ${crn}`,
        });
        return;
      }

      res.json({
        success: true,
        sectionCRN: crn,
        meetingTimes,
        count: meetingTimes.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching section meeting times:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

export { handleGetAllMeetings, handleGetMeetingTimesBySectionCRN };