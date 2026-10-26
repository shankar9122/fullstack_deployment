import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      enum: {
        values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        message: 'Class name must be between 1 and 12',
      },
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
      match: [/^[A-F]$/, 'Section must be a single letter from A to F'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      match: [/^\d{4}-\d{2}$/, 'Academic year must look like 2025-26'],
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  },
  { timestamps: true },
);

// Same class + section + year dobara nahi ban sakta (compound unique index)
classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

export const Class = mongoose.model('Class', classSchema);
