import mongoose, { Schema, Document } from "mongoose";

export interface ICourseTransferData extends Document {
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
        SendingCourseNumber: [{
            type: [String],
            required: true,
        }],
        SendingInstitutionCode: {
            type: String,
            required: true,
            trim: true,
        },
        SendingSubject: [{
            type: [String],
            required: true,
        }],
        SendingCredits: [{
            type: [Number],
            required: true,
        }],
        ReceivingCourseNumber: [{
            type: [String],
            required: true,
        }],
        RecevingInstitutionCode: {
            type: String,
            required: true,
            trim: true,
        },
        ReceivingSubject: [{
            type: [String],
            required: true,
        }],
        ReceivingCredits: [{
            type: [Number],
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
CourseTransferDataSchema.index({ SendingInstitutionCode: 1, SendingSubject: 1, SendingCourseNumber: 1 });
CourseTransferDataSchema.index({ RecevingInstitutionCode: 1, ReceivingSubject: 1, ReceivingCourseNumber: 1 });
CourseTransferDataSchema.index({ StartDate: 1, EndDate: 1 });


export const CourseTransferData = mongoose.model<ICourseTransferData>(
  "CourseTransferData",
  CourseTransferDataSchema
);

export { CourseTransferDataSchema };