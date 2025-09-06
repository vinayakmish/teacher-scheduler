import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import {
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  AuthResponse,
  UserRole,
} from '@teacher-scheduler/shared-types';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Public registration endpoint for initial setup
router.post('/register/public', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role }: RegisterRequest =
      req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      } as ApiResponse);
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      } as ApiResponse);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new UserModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    });

    await user.save();

    // Generate JWT token for the new user
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(201).json({
      success: true,
      data: {
        token,
        user: userResponse,
      },
      message: 'User created successfully',
    } as ApiResponse<AuthResponse>);
  } catch (error) {
    console.error('Public register error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

// Register (Admin only)
router.post(
  '/register',
  authenticate,
  authorize(UserRole.ADMIN),
  async (req, res) => {
    try {
      const { email, password, firstName, lastName, role }: RegisterRequest =
        req.body;

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists',
        } as ApiResponse);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = new UserModel({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      });

      await user.save();

      const userResponse = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.status(201).json({
        success: true,
        data: userResponse,
        message: 'User created successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
);

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      } as ApiResponse);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      } as ApiResponse);
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      success: true,
      data: {
        token,
        user: userResponse,
      },
    } as ApiResponse<AuthResponse>);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse);
  }
});

export default router;
