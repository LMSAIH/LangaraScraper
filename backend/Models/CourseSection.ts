import mongoose, { Schema, Document } from "mongoose";

export interface ICourseSection extends Document {
  courseCode: string; // Reference to CourseData
  crn: string;
  subject: string;
  course: string;
  section: string;
  credits: string;
  title: string;
  seatsAvailable: string;
  waitlist: string;
  additionalFees: string;
  repeatLimit: string;
  notes?: string;
  term: string;
  year: number;
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSectionSchema: Schema = new Schema(
  {
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    crn: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    credits: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    seatsAvailable: {
      type: String,
      required: true,
      trim: true,
    },
    waitlist: {
      type: String,
      optional: true,
      trim: true,
      default: "",
    },
    additionalFees: {
      type: String,
      default: "",
      trim: true,
    },
    repeatLimit: {
      type: String,
      default: "-",
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
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
  }
);

// Indexes
CourseSectionSchema.index({ courseCode: 1, term: 1 });
CourseSectionSchema.index({ crn: 1, year:1, term: 1 }, { unique: true });
CourseSectionSchema.index({ subject: 1, year: 1, semester: 1 });

// Static methods
CourseSectionSchema.statics.findByCourseCode = function (
  courseCode: string,
  year?: number,
  semester?: number
) {
  const query: any = { courseCode };
  if (year) query.year = year;
  if (semester) query.semester = semester;
  return this.find(query).sort({ section: 1 });
};

CourseSectionSchema.statics.findAvailable = function (
  year?: number,
  semester?: number
) {
  const query: any = { seatsAvailable: { $gt: "0" } };
  if (year) query.year = year;
  if (semester) query.semester = semester;
  return this.find(query).sort({ subject: 1, courseCode: 1 });
};

export const CourseSection = mongoose.model<ICourseSection>(
  "CourseSection",
  CourseSectionSchema
);

export { CourseSectionSchema };