import mongoose, { Schema, Document } from "mongoose";

export interface ICourseInfo extends Document {
  courseCode: string;
  title: string;
  description?: string;
  attributes?: string[];
  updatedAt: Date;
}

const CourseInfoSchema: Schema = new Schema(
  {
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    attributes: [{
      type: String,
      trim: true,
      uppercase: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
CourseInfoSchema.index({ courseCode: 1}, { unique: true });
CourseInfoSchema.index({ attributes: 1});

// Static methods
CourseInfoSchema.statics.findByCourseCode = function (courseCode: string) {
  return this.find({ courseCode: courseCode.toUpperCase() }).sort({ courseCode: 1 });
};

CourseInfoSchema.statics.findByAttribute = function (attribute: string) {
  return this.find({ attributes: attribute.toUpperCase() }).sort({ courseCode: 1 });
};

export const CourseInfo = mongoose.model<ICourseInfo>(
  "CourseInfo",
  CourseInfoSchema
);

export { CourseInfoSchema }; 