import mongoose, { Schema, Document } from "mongoose";

export interface IMeetingTime extends Document {
  sectionCRN: string; // Reference to CourseSection
  sectionType: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
  term: string;
  year: number;
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingTimeSchema = new Schema(
  {
    sectionCRN: {
      type: String,
      required: true,
      index: true,
    },
    sectionType: {
      type: String,
      required: false,
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
        "Exam",
        "Flexible Assessment",
        "CO-OP(on site work experience)",
        "",
        "GIS Guided Independent Study"
      ],
    },
    days: {
      type: String,
      required: false,
      trim: true,
    },
    time: {
      type: String,
      required: false,
      trim: true,
    },
    room: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    instructor: {
      type: String,
      required: false,
      trim: true,
      default: "",
      index: true,
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
MeetingTimeSchema.index({ sectionCRN: 1, term: 1 });
MeetingTimeSchema.index({ instructor: 1, year: 1, semester: 1 });
MeetingTimeSchema.index({ sectionType: 1, year: 1, semester: 1 });

// Static methods
MeetingTimeSchema.statics.findByInstructor = function (
  instructor: string,
  year?: number,
  semester?: number
) {
  const query: any = { instructor: new RegExp(instructor, "i") };
  if (year) query.year = year;
  if (semester) query.semester = semester;
  return this.find(query).sort({ sectionCRN: 1 });
};

MeetingTimeSchema.statics.findByCRN = function (
  sectionCRN: string,
  year?: number,
  semester?: number
) {
  const query: any = { sectionCRN };
  if (year) query.year = year;
  if (semester) query.semester = semester;
  return this.find(query).sort({ sectionType: 1 });
};

export const MeetingTime = mongoose.model<IMeetingTime>(
  "MeetingTime",
  MeetingTimeSchema
);

export { MeetingTimeSchema };