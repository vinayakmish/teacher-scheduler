import request from 'supertest';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import authRoutes from '../routes/auth';
import scheduleRoutes from '../routes/schedules';
import { errorHandler } from '../middleware/errorHandler';
import { UserModel } from '../models/User';
import { ScheduleModel } from '../models/Schedule';
import { UserRole } from '@teacher-scheduler/shared-types';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/schedules', scheduleRoutes);
  app.use(errorHandler);
  return app;
};

describe('Schedule API Tests', () => {
  let app: express.Application;
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;
  let teacherId: string;
  let studentId: string;
  let scheduleId: string;

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
    await ScheduleModel.deleteMany({});

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

    teacherId = teacher._id.toString();
    studentId = student._id.toString();

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
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await ScheduleModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Schedule Creation Tests', () => {
    test('POST /api/schedules - teacher should create schedule', async () => {
      const scheduleData = {
        subject: 'Mathematics',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        startTime: '09:00',
        endTime: '10:00',
        notes: 'Basic algebra class',
        summary: 'Introduction to algebra',
        maxStudents: 25,
      };

      const response = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(scheduleData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subject).toBe('Mathematics');
      expect(response.body.data.teacher).toBeDefined();
      scheduleId = response.body.data._id;
    });

    test('POST /api/schedules - student should not create schedule', async () => {
      const scheduleData = {
        subject: 'Physics',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        startTime: '10:00',
        endTime: '11:00',
        notes: 'Physics class',
        summary: 'Introduction to physics',
        maxStudents: 20,
      };

      const response = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(scheduleData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Schedule Retrieval Tests', () => {
    test('GET /api/schedules - should get all schedules', async () => {
      const response = await request(app)
        .get('/api/schedules')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/schedules/:id - should get schedule by ID', async () => {
      const response = await request(app)
        .get(`/api/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(scheduleId);
    });

    test('GET /api/schedules/:id - should return 404 for non-existent schedule', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/api/schedules/${fakeId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Schedule Update Tests', () => {
    test('PUT /api/schedules/:id - teacher should update own schedule', async () => {
      const updateData = {
        subject: 'Advanced Mathematics',
        notes: 'Advanced algebra class',
      };

      const response = await request(app)
        .put(`/api/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subject).toBe('Advanced Mathematics');
      expect(response.body.data.notes).toBe('Advanced algebra class');
    });

    test('PUT /api/schedules/:id - admin should update any schedule', async () => {
      const updateData = {
        maxStudents: 30,
      };

      const response = await request(app)
        .put(`/api/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.maxStudents).toBe(30);
    });

    test('PUT /api/schedules/:id - student should not update schedule', async () => {
      const updateData = {
        subject: 'Hacked Subject',
      };

      const response = await request(app)
        .put(`/api/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Schedule Enrollment Tests', () => {
    test('POST /api/schedules/:id/enroll - student should enroll in schedule', async () => {
      const response = await request(app)
        .post(`/api/schedules/${scheduleId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.enrolledStudents).toContain(studentId);
    });

    test('POST /api/schedules/:id/enroll - should not allow duplicate enrollment', async () => {
      const response = await request(app)
        .post(`/api/schedules/${scheduleId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('POST /api/schedules/:id/enroll - teacher should not enroll', async () => {
      const response = await request(app)
        .post(`/api/schedules/${scheduleId}/enroll`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('POST /api/schedules/:id/unenroll - student should unenroll from schedule', async () => {
      const response = await request(app)
        .post(`/api/schedules/${scheduleId}/unenroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.enrolledStudents).not.toContain(studentId);
    });

    test('POST /api/schedules/:id/unenroll - should not unenroll if not enrolled', async () => {
      const response = await request(app)
        .post(`/api/schedules/${scheduleId}/unenroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Schedule Deletion Tests', () => {
    test('DELETE /api/schedules/:id - teacher should delete own schedule', async () => {
      const response = await request(app)
        .delete(`/api/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('DELETE /api/schedules/:id - should return 404 for deleted schedule', async () => {
      const response = await request(app)
        .delete(`/api/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Authorization Tests', () => {
    test('Should reject requests without token', async () => {
      const response = await request(app).get('/api/schedules');
      expect(response.status).toBe(401);
    });

    test('Should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/schedules')
        .set('Authorization', 'Bearer invalidtoken');
      expect(response.status).toBe(401);
    });
  });
});

export default createTestApp;
