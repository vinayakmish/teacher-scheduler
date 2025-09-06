import mongoose, { Document, Schema } from 'mongoose';
import { User, UserRole } from '@teacher-scheduler/shared-types';

export interface UserDocument extends Omit<User, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
