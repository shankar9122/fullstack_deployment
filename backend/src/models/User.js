import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const ROLES = ['admin', 'teacher'];
export const BCRYPT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        // bcrypt only reads the first 72 bytes, so longer passwords would be silently truncated
        validator: (value) => Buffer.byteLength(value, 'utf8') <= 72,
        message: 'Password cannot exceed 72 bytes',
      },
      select: false, // never returned by queries unless explicitly requested
    },
    role: {
      type: String,
      enum: { values: ROLES, message: 'Role must be admin or teacher' },
      default: 'teacher',
    },
    isActive: { type: Boolean, default: true },
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      // A freshly created document still holds its password hash in memory,
      // so strip it from every JSON response
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Validation runs before this hook, so the length rules apply to the plain password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);

  // Used to invalidate tokens issued before a password change
  if (!this.isNew) this.passwordChangedAt = new Date();
});

export const User = mongoose.model('User', userSchema);
