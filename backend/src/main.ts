import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import scheduleRoutes from './routes/schedules';
import { errorHandler } from './middleware/errorHandler';
import { UserModel } from './models/User';
import { UserRole } from '@teacher-scheduler/shared-types';

dotenv.config();

const app = express();
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/teacherscheduler';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedules', scheduleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Teacher Scheduler API is running' });
});

app.get('/', (req, res) => {
  res.send({ message: 'Teacher Scheduler API' });
});

// Error handling middleware
app.use(errorHandler);

// Function to clean up database in development mode
const cleanupDevDatabase = async () => {
  if (
    process.env.NODE_ENV !== 'development' ||
    process.env.SKIP_DB_CLEANUP === 'true'
  ) {
    return;
  }

  try {
    console.log('🧹 Development mode: Cleaning up database...');

    // Get all collections
    const collections = await mongoose.connection.db.collections();

    // Clear all collections except keep admin user
    for (const collection of collections) {
      if (collection.collectionName === 'users') {
        // Keep only admin users
        await collection.deleteMany({ role: { $ne: 'admin' } });
      } else {
        // Clear other collections completely
        await collection.deleteMany({});
      }
    }

    console.log('✅ Database cleanup completed');
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
  }
};

// Function to create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await UserModel.findOne({ role: UserRole.ADMIN });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin', 12);

      const defaultAdmin = new UserModel({
        email: 'admin@admin.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
      });

      await defaultAdmin.save();
      console.log('✅ Default admin user created:');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Password: admin');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

// Function to seed development data
const seedDevelopmentData = async () => {
  if (
    process.env.NODE_ENV !== 'development' ||
    process.env.SKIP_DEV_SEED === 'true'
  ) {
    return;
  }

  try {
    console.log('🌱 Seeding development data...');

    // Create sample teachers
    const teacherPassword = await bcrypt.hash('teacher123', 12);
    const teachers = [
      {
        email: 'john.doe@school.com',
        password: teacherPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.TEACHER,
      },
      {
        email: 'jane.smith@school.com',
        password: teacherPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.TEACHER,
      },
    ];

    // Create sample students
    const studentPassword = await bcrypt.hash('student123', 12);
    const students = [
      {
        email: 'alice.johnson@student.com',
        password: studentPassword,
        firstName: 'Alice',
        lastName: 'Johnson',
        role: UserRole.STUDENT,
      },
      {
        email: 'bob.wilson@student.com',
        password: studentPassword,
        firstName: 'Bob',
        lastName: 'Wilson',
        role: UserRole.STUDENT,
      },
      {
        email: 'charlie.brown@student.com',
        password: studentPassword,
        firstName: 'Charlie',
        lastName: 'Brown',
        role: UserRole.STUDENT,
      },
    ];

    // Insert users if they don't exist
    for (const teacher of teachers) {
      const exists = await UserModel.findOne({ email: teacher.email });
      if (!exists) {
        await new UserModel(teacher).save();
      }
    }

    for (const student of students) {
      const exists = await UserModel.findOne({ email: student.email });
      if (!exists) {
        await new UserModel(student).save();
      }
    }

    console.log('✅ Development data seeded successfully');
    console.log(
      '👨‍🏫 Teachers: john.doe@school.com, jane.smith@school.com (password: teacher123)'
    );
    console.log(
      '👨‍🎓 Students: alice.johnson@student.com, bob.wilson@student.com, charlie.brown@student.com (password: student123)'
    );
  } catch (error) {
    console.error('❌ Error seeding development data:', error);
  }
};

// Development-only endpoint for database cleanup
if (process.env.NODE_ENV === 'development') {
  app.post('/api/dev/cleanup', async (req, res) => {
    try {
      await cleanupDevDatabase();
      await createDefaultAdmin();
      await seedDevelopmentData();
      res.json({
        success: true,
        message: 'Database cleaned up and reseeded successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup database',
        error: error.message,
      });
    }
  });
}

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Development mode setup
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Running in development mode');

      // Clean up database if not skipped
      await cleanupDevDatabase();

      // Create default admin user
      await createDefaultAdmin();

      // Seed development data
      await seedDevelopmentData();
    } else {
      // Only create admin in production if needed
      await createDefaultAdmin();
    }

    app.listen(port, host, () => {
      console.log(`🚀 Application running on: http://${host}:${port}`);

      if (process.env.NODE_ENV === 'development') {
        console.log('🛠️  Development endpoints:');
        console.log(`   📧 Admin: admin@admin.com (password: admin)`);
        console.log(
          `   🧹 Cleanup: POST http://${host}:${port}/api/dev/cleanup`
        );
        console.log('💡 Environment variables:');
        console.log(
          '   SKIP_DB_CLEANUP=true - Skip database cleanup on startup'
        );
        console.log('   SKIP_DEV_SEED=true - Skip development data seeding');
      }
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });
