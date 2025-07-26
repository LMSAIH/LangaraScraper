import mongoose, { Document, Schema } from 'mongoose';

export interface IProfessor extends Document {
  name: string;
  department: string;
  avg_rating: number;
  avg_difficulty: number;
  num_ratings: number;
  would_take_again_percent: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProfessorSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  avg_rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  avg_difficulty: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  num_ratings: {
    type: Number,
    required: true,
    min: 0
  },
  would_take_again_percent: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true
});

// Create index for faster searches
ProfessorSchema.index({ name: 1 });
ProfessorSchema.index({ department: 1 });
ProfessorSchema.index({ avg_rating: -1 });

export const Professor = mongoose.model<IProfessor>('Professor', ProfessorSchema);
