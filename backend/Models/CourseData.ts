import { CourseSectionSchema, ICourseSection } from "./CourseSection";
import mongoose, { Schema } from "mongoose";

export interface ICourseData extends Document {
  courseCode: string;
  subject: string;
  sections: ICourseSection[];
  term: string; // Added for better data organization (e.g., "202530")
  year: number;
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

// CourseData Schema
const CourseDataSchema: Schema = new Schema(
  {
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    sections: [CourseSectionSchema],
    term: {
      type: String,
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
CourseDataSchema.index({ courseCode: 1, term: 1 }, { unique: true });
CourseDataSchema.index({ subject: 1, year: 1, semester: 1 });
// Static methods
CourseDataSchema.statics.findByTerm = function (
  year: number,
  semester: number
) {
  return this.find({ year, semester }).sort({ subject: 1, courseCode: 1 });
};

CourseDataSchema.statics.findBySubject = function (
  subject: string,
  year?: number,
  semester?: number
) {
  const query: any = { subject: subject.toUpperCase() };
  if (year) query.year = year;
  if (semester) query.semester = semester;
  return this.find(query).sort({ courseCode: 1 });
};

CourseDataSchema.statics.findByInstructor = function (
  instructor: string,
  year?: number,
  semester?: number
) {
  const query: any = { "sections.instructor": new RegExp(instructor, "i") };
  if (year) query.year = year;
  if (semester) query.semester = semester;
  return this.find(query).sort({ subject: 1, courseCode: 1 });
};

// Instance methods
CourseDataSchema.methods.getAvailableSections = function () {
  return this.sections.filter((section: any) => {
    const available = parseInt(section.seatsAvailable);
    return available > 0;
  });
};

CourseDataSchema.methods.getSectionsByCRN = function (crns: string[]) {
  return this.sections.filter((section: any) => crns.includes(section.crn));
};

// Export models
export const CourseData = mongoose.model<ICourseData>(
  "CourseData",
  CourseDataSchema
);

// Export schemas for embedding
export { CourseDataSchema };
