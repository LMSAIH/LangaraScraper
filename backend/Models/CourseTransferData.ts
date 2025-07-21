import mongoose, { Schema, Document } from "mongoose";

export interface ICourseTransferData extends Document {
  type: string;
  SendingCourseNumber: string[];
  SendingInstitutionCode: string;
  SendingSubject: string[];
  SendingCredits: number[];
  ReceivingCourseNumber: string[];
  RecevingInstitutionCode: string;
  ReceivingSubject: string[];
  ReceivingCredits: number[];
  StartDate: number;
  EndDate?: number;
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseTransferDataSchema: Schema = new Schema(
    {
        type: {
            type: String,
            required: true,
            trim: true,
        },
        SendingCourseNumber: [{
            type: String,
            required: true,
        }],
        SendingInstitutionCode: {
            type: String,
            required: true,
            trim: true,
        },
        SendingSubject: [{
            type: String,
            required: true,
        }],
        SendingCredits: [{
            type: Number,
            required: true,
        }],
        ReceivingCourseNumber: [{
            type: String,
            required: true,
        }],
        RecevingInstitutionCode: {
            type: String,
            required: true,
            trim: true,
        },
        ReceivingSubject: [{
            type: String,
            required: true,
        }],
        ReceivingCredits: [{
            type: Number,
            required: true,
        }],
        StartDate: {
            type: Number,
            required: true,
        },
        EndDate: {
            type: Number,
            required: false,
        },
        details: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
CourseTransferDataSchema.index({ courseCode: 1, term: 1 }, { unique: true });
CourseTransferDataSchema.index({ subject: 1, year: 1, semester: 1 });


export const CourseTransferData = mongoose.model<ICourseTransferData>(
  "CourseTransferData",
  CourseTransferDataSchema
);

export { CourseTransferDataSchema };