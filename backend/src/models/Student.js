import mongoose from 'mongoose';
import { getPhotoUrl } from '../services/photoStorage.js';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    rollNumber: {
      type: Number,
      required: [true, 'Roll number is required'],
      min: [1, 'Roll number must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Roll number must be a whole number',
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // email optional,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: (value) => value <= new Date(),
        message: 'Date of birth cannot be in the future',
      },
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Gender must be male, female or other',
      },
    },
    guardianName: {
      type: String,
      required: [true, 'Guardian name is required'],
      trim: true,
    },
    guardianPhone: {
      type: String,
      required: [true, 'Guardian phone is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Guardian phone must be a valid 10-digit Indian number'],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    photo: {
      publicId: { type: String },
      version: { type: Number },
    },
  },

  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.photo; // storage details stay on the server
        delete ret.id; // virtuals: true adds a duplicate of _id
        return ret;
      },
    },
  },
);

// each class has unique roll number
studentSchema.index({ class: 1, rollNumber: 1 }, { unique: true });
// Appears in every student response as "photoUrl" (a signed URL, or null when there is no photo)
studentSchema.virtual('photoUrl').get(function () {
  return this.photo?.publicId ? getPhotoUrl(this.photo) : null;
});

export const Student = mongoose.model('Student', studentSchema);
