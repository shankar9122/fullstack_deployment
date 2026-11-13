import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { EMAIL_PATTERN, PHONE_PATTERN } from '../../common/constants/patterns';

// "type" is written explicitly on every @Prop because TypeScript cannot always tell
// Mongoose the type of optional or union fields
@Schema({ timestamps: true })
export class Teacher {
  @Prop({
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  })
  name!: string;

  @Prop({
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [EMAIL_PATTERN, 'Invalid email address'],
  })
  email!: string;

  @Prop({
    type: String,
    trim: true,
    match: [PHONE_PATTERN, 'Phone must be a valid 10-digit Indian number'],
  })
  phone?: string | null;

  @Prop({ type: String, required: [true, 'Subject is required'], trim: true })
  subject!: string;

  // Added by "timestamps: true", declared here only so TypeScript knows about them
  createdAt?: Date;
  updatedAt?: Date;
}

export type TeacherDocument = HydratedDocument<Teacher>;
export const TeacherSchema = SchemaFactory.createForClass(Teacher);