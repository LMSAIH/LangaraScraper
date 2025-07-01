import mongoose, { Schema, Document } from "mongoose";

export interface ICourseData extends Document {
  courseCode: string;
  subject: string;
  term: string;
  year: number;
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

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

export const CourseData = mongoose.model<ICourseData>(
  "CourseData",
  CourseDataSchema
);

export { CourseDataSchema };