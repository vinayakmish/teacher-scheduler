import request from 'supertest';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import authRoutes from '../routes/auth';
import userRoutes from '../routes/users';
import { errorHandler } from '../middleware/errorHandler';
import { UserModel } from '../models/User';
import { UserRole } from '@teacher-scheduler/shared-types';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use(errorHandler);
  return app;
};

describe('User API Tests', () => {
  let app: express.Application;
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI ||
          'mongodb://localhost:27017/teacherscheduler_test'
      );
    }

    app = createTestApp();

    // Clean up database
    await UserModel.deleteMany({});

    // Create test users
    const hashedPassword = await bcrypt.hash('testpass123', 12);

    const admin = await UserModel.create({
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });

    const teacher = await UserModel.create({
      email: 'teacher@test.com',
      password: hashedPassword,
      firstName: 'Teacher',
      lastName: 'User',
      role: UserRole.TEACHER,
    });

    const student = await UserModel.create({
      email: 'student@test.com',
      password: hashedPassword,
      firstName: 'Student',
      lastName: 'User',
      role: UserRole.STUDENT,
    });

    // Login to get tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'testpass123' });
    adminToken = adminLogin.body.data.token;

    const teacherLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teacher@test.com', password: 'testpass123' });
    teacherToken = teacherLogin.body.data.token;

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@test.com', password: 'testpass123' });
    studentToken = studentLogin.body.data.token;

    testUserId = student._id.toString();
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Authentication Tests', () => {
    test('POST /api/auth/register - should create new user', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'newuser@test.com',
        password: 'newpass123',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.STUDENT,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('newuser@test.com');
    });

    test('POST /api/auth/register - should fail with duplicate email', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'admin@test.com',
        password: 'newpass123',
        firstName: 'Duplicate',
        lastName: 'User',
        role: UserRole.STUDENT,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('POST /api/auth/login - should login successfully', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'testpass123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('admin@test.com');
    });

    test('POST /api/auth/login - should fail with wrong password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'admin@test.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('User Management Tests', () => {
    test('GET /api/users - admin should get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/users - teacher should not access all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('GET /api/users/teachers - should get all teachers', async () => {
      const response = await request(app)
        .get('/api/users/teachers')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/users/students - teacher should get all students', async () => {
      const response = await request(app)
        .get('/api/users/students')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/users/students - student should not access students', async () => {
      const response = await request(app)
        .get('/api/users/students')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('GET /api/users/profile - should get current user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('admin@test.com');
      expect(response.body.data.password).toBeUndefined();
    });

    test('PUT /api/users/profile - should update user profile', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Student',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('Student');
    });

    test('DELETE /api/users/:id - admin should delete user', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('DELETE /api/users/:id - teacher should not delete user', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Authorization Tests', () => {
    test('Should reject requests without token', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(401);
    });

    test('Should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalidtoken');
      expect(response.status).toBe(401);
    });
  });
});

export default createTestApp;
