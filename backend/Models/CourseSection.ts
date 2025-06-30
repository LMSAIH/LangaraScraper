import mongoose, { Schema, Document } from "mongoose";

// Interface for TypeScript typing
export interface ICourseSection extends Document {
  crn: string;
  subject: string;
  course: string;
  section: string;
  credits: string;
  title: string;
  type: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
  seatsAvailable: string;
  waitlist: string;
  additionalFees: string;
  repeatLimit: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// CourseSection Schema
const CourseSectionSchema: Schema = new Schema(
  {
    crn: {
      type: String,
      required: true,
      unique: true,
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
    type: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Lecture",
        "Lab",
        "Seminar",
        "WWW",
        "Tutorial",
        "Studio",
        "Clinical",
        "Practicum",
        "Field Study",
        "Field School",
        "On Site Work",
        "Exchange-International",
      ],
    },
    days: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    room: {
      type: String,
      optional: true,
      trim: true,
    },
    instructor: {
      type: String,
      trim: true,
      optional: true,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Export models
export const CourseSection = mongoose.model<ICourseSection>(
  "CourseSection",
  CourseSectionSchema
);

// Export schemas for embedding
export { CourseSectionSchema };
