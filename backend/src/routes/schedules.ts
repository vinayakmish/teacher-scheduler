import express from 'express';
import { Types } from 'mongoose';
import { ScheduleModel } from '../models/Schedule';
import { UserModel } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import {
  UserRole,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ApiResponse,
  User,
} from '@teacher-scheduler/shared-types';

// Extend Express Request type to include user
interface AuthenticatedRequest extends express.Request {
  user: User;
}

const router = express.Router();

// Dashboard stats endpoint (Admin only)
router.get(
  '/dashboard/stats',
  authenticate,
  authorize(UserRole.ADMIN),
  async (req: AuthenticatedRequest, res) => {
    try {
      // Get all users count by role
      const totalUsers = await UserModel.countDocuments();
      const totalTeachers = await UserModel.countDocuments({
        role: UserRole.TEACHER,
      });
      const totalStudents = await UserModel.countDocuments({
        role: UserRole.STUDENT,
      });

      // Get schedules stats
      const totalSchedules = await ScheduleModel.countDocuments();
      const now = new Date();
      const activeSchedules = await ScheduleModel.countDocuments({
        date: { $gte: now },
      });

      // Get total enrollments
      const schedules = await ScheduleModel.find({}, 'enrolledStudents');
      const enrollmentCount = schedules.reduce(
        (sum, schedule) => sum + (schedule.enrolledStudents?.length || 0),
        0
      );

      const stats = {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalSchedules,
        activeSchedules,
        enrollmentCount,
      };

      res.json({
        success: true,
        data: stats,
      } as ApiResponse);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// Get all schedules (Admin can see all, Teachers see their own, Students see all available)
router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    let query = {};

    // If teacher, show only their schedules
    if (user.role === UserRole.TEACHER) {
      query = { teacher: user._id };
    }
    // Students and admins can see all schedules
    // No query filter for students and admins - they see all schedules

    const schedules = await ScheduleModel.find(query)
      .populate('teacher', 'firstName lastName email')
      .populate('enrolledStudents', 'firstName lastName email')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      data: schedules,
    } as ApiResponse);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// Get schedule by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await ScheduleModel.findById(id)
      .populate('teacher', 'firstName lastName email')
      .populate('enrolledStudents', 'firstName lastName email');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: schedule,
    } as ApiResponse);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// Create schedule (Teachers only)
router.post(
  '/',
  authenticate,
  authorize(UserRole.TEACHER),
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const {
        subject,
        date,
        startTime,
        endTime,
        notes,
        summary,
        maxStudents,
      }: CreateScheduleRequest = req.body;

      // Comprehensive input validation
      if (
        !subject ||
        typeof subject !== 'string' ||
        subject.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          error: 'Subject is required and must be a non-empty string',
        } as ApiResponse);
      }

      if (!date || isNaN(Date.parse(date))) {
        return res.status(400).json({
          success: false,
          error: 'Valid date is required',
        } as ApiResponse);
      }

      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'Start time and end time are required',
        } as ApiResponse);
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({
          success: false,
          error: 'Time must be in HH:MM format',
        } as ApiResponse);
      }

      // Validate that end time is after start time
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time',
        } as ApiResponse);
      }

      // Validate maxStudents
      if (
        !maxStudents ||
        typeof maxStudents !== 'number' ||
        maxStudents < 1 ||
        maxStudents > 1000
      ) {
        return res.status(400).json({
          success: false,
          error: 'Max students must be a number between 1 and 1000',
        } as ApiResponse);
      }

      // Validate date is not in the past (allow today)
      const scheduleDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (scheduleDate < today) {
        return res.status(400).json({
          success: false,
          error: 'Schedule date cannot be in the past',
        } as ApiResponse);
      }

      // Check for conflicting schedules for the same teacher
      const conflictingSchedule = await ScheduleModel.findOne({
        teacher: user._id,
        date: scheduleDate,
        $or: [
          {
            startTime: { $lte: startTime },
            endTime: { $gt: startTime },
          },
          {
            startTime: { $lt: endTime },
            endTime: { $gte: endTime },
          },
          {
            startTime: { $gte: startTime },
            endTime: { $lte: endTime },
          },
        ],
      });

      if (conflictingSchedule) {
        return res.status(400).json({
          success: false,
          error:
            'You already have a schedule that conflicts with this time slot',
        } as ApiResponse);
      }

      const schedule = new ScheduleModel({
        teacher: user._id,
        subject: subject.trim(),
        date: scheduleDate,
        startTime,
        endTime,
        notes: notes ? notes.trim() : '',
        summary: summary ? summary.trim() : '',
        maxStudents,
        enrolledStudents: [],
      });

      await schedule.save();
      await schedule.populate('teacher', 'firstName lastName email');

      res.status(201).json({
        success: true,
        data: schedule,
      } as ApiResponse);
    } catch (error) {
      console.error('Create schedule error:', error);

      // Handle mongoose validation errors
      if (error instanceof Error && error.name === 'ValidationError') {
        const validationError = error as Error & {
          errors: Record<string, { message: string }>;
        };
        return res.status(400).json({
          success: false,
          error: Object.values(validationError.errors)
            .map((e) => e.message)
            .join(', '),
        } as ApiResponse);
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// Update schedule (Teachers can update their own, Admins can update any)
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const updateData: UpdateScheduleRequest = req.body;

    const schedule = await ScheduleModel.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      } as ApiResponse);
    }

    // Check if user can update this schedule
    if (
      user.role !== UserRole.ADMIN &&
      schedule.teacher.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      } as ApiResponse);
    }

    // Update fields
    if (updateData.subject !== undefined) schedule.subject = updateData.subject;
    if (updateData.date !== undefined)
      schedule.date = new Date(updateData.date);
    if (updateData.startTime !== undefined)
      schedule.startTime = updateData.startTime;
    if (updateData.endTime !== undefined) schedule.endTime = updateData.endTime;
    if (updateData.notes !== undefined) schedule.notes = updateData.notes;
    if (updateData.summary !== undefined) schedule.summary = updateData.summary;
    if (updateData.maxStudents !== undefined)
      schedule.maxStudents = updateData.maxStudents;

    await schedule.save();
    await schedule.populate('teacher', 'firstName lastName email');
    await schedule.populate('enrolledStudents', 'firstName lastName email');

    res.json({
      success: true,
      data: schedule,
    } as ApiResponse);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// Delete schedule (Teachers can delete their own, Admins can delete any)
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const schedule = await ScheduleModel.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      } as ApiResponse);
    }

    // Check if user can delete this schedule
    if (
      user.role !== UserRole.ADMIN &&
      schedule.teacher.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      } as ApiResponse);
    }

    await ScheduleModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Schedule deleted successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// Enroll in schedule (Students only)
router.post(
  '/:id/enroll',
  authenticate,
  authorize(UserRole.STUDENT),
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const { id } = req.params;

      // Validate schedule ID format
      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid schedule ID format',
        } as ApiResponse);
      }

      // Use atomic operation to prevent race conditions
      const result = await ScheduleModel.findOneAndUpdate(
        {
          _id: id,
          enrolledStudents: {
            $not: { $elemMatch: { $eq: new Types.ObjectId(user._id) } },
          },
          $expr: { $lt: [{ $size: '$enrolledStudents' }, '$maxStudents'] },
        },
        {
          $push: { enrolledStudents: new Types.ObjectId(user._id) },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate('teacher', 'firstName lastName email')
        .populate('enrolledStudents', 'firstName lastName email');

      if (!result) {
        // Check if schedule exists to provide specific error message
        const schedule = await ScheduleModel.findById(id);
        if (!schedule) {
          return res.status(404).json({
            success: false,
            error: 'Schedule not found',
          } as ApiResponse);
        }

        if (
          schedule.enrolledStudents.some(
            (studentId) => studentId.toString() === user._id
          )
        ) {
          return res.status(400).json({
            success: false,
            error: 'Already enrolled in this schedule',
          } as ApiResponse);
        }

        if (schedule.enrolledStudents.length >= schedule.maxStudents) {
          return res.status(400).json({
            success: false,
            error: 'Schedule is full',
          } as ApiResponse);
        }

        return res.status(400).json({
          success: false,
          error: 'Unable to enroll in schedule',
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: result,
        message: 'Successfully enrolled in schedule',
      } as ApiResponse);
    } catch (error) {
      console.error('Enroll error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// Unenroll from schedule (Students only)
router.post(
  '/:id/unenroll',
  authenticate,
  authorize(UserRole.STUDENT),
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const { id } = req.params;

      const schedule = await ScheduleModel.findById(id);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found',
        } as ApiResponse);
      }

      // Check if enrolled
      const enrolledIndex = schedule.enrolledStudents.findIndex(
        (studentId) => studentId.toString() === user._id.toString()
      );

      if (enrolledIndex === -1) {
        return res.status(400).json({
          success: false,
          error: 'Not enrolled in this schedule',
        } as ApiResponse);
      }

      schedule.enrolledStudents.splice(enrolledIndex, 1);
      await schedule.save();
      await schedule.populate('teacher', 'firstName lastName email');
      await schedule.populate('enrolledStudents', 'firstName lastName email');

      res.json({
        success: true,
        data: schedule,
        message: 'Successfully unenrolled from schedule',
      } as ApiResponse);
    } catch (error) {
      console.error('Unenroll error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

export default router;
