import mongoose, { Document, Schema } from 'mongoose';
import { Schedule } from '@teacher-scheduler/shared-types';

export interface ScheduleDocument
  extends Omit<Schedule, '_id' | 'teacher' | 'enrolledStudents'>,
    Document {
  teacher: mongoose.Types.ObjectId;
  enrolledStudents: mongoose.Types.ObjectId[];
}

const ScheduleSchema = new Schema<ScheduleDocument>(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    maxStudents: {
      type: Number,
      required: true,
      min: 1,
      default: 30,
    },
    enrolledStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ScheduleSchema.index({ teacher: 1 });
ScheduleSchema.index({ date: 1 });
ScheduleSchema.index({ teacher: 1, date: 1 });
ScheduleSchema.index({ enrolledStudents: 1 });

// Validate that end time is after start time
ScheduleSchema.pre('save', function (this: ScheduleDocument) {
  const startTime = this.startTime;
  const endTime = this.endTime;

  if (startTime >= endTime) {
    throw new Error('End time must be after start time');
  }
});

export const ScheduleModel = mongoose.model<ScheduleDocument>(
  'Schedule',
  ScheduleSchema
);
