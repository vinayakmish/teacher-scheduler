import express from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole, ApiResponse } from '@teacher-scheduler/shared-types';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  try {
    const users = await UserModel.find().select('-password');
    res.json({
      success: true,
      data: users,
    } as ApiResponse);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// Get teachers (Students and Admins can view)
router.get('/teachers', authenticate, async (req, res) => {
  try {
    const teachers = await UserModel.find({ role: UserRole.TEACHER }).select(
      '-password'
    );
    res.json({
      success: true,
      data: teachers,
    } as ApiResponse);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// Get students (Admin and Teachers can view)
router.get(
  '/students',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.TEACHER),
  async (req, res) => {
    try {
      const students = await UserModel.find({ role: UserRole.STUDENT }).select(
        '-password'
      );
      res.json({
        success: true,
        data: students,
      } as ApiResponse);
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await UserModel.findById((req as any).user._id).select(
      '-password'
    );
    res.json({
      success: true,
      data: user,
    } as ApiResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = (req as any).user._id;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user,
    } as ApiResponse);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
      } as ApiResponse);
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long',
      } as ApiResponse);
    }

    // Get user with password to verify current password
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      } as ApiResponse);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
      } as ApiResponse);
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await UserModel.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({
      success: true,
      message: 'Password changed successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// Delete user (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  async (req, res) => {
    try {
      const { id } = req.params;
      await UserModel.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'User deleted successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

export default router;
