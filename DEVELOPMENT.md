# Teacher Scheduler - Development Guide

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start MongoDB:**

   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

3. **Run the application:**

   ```bash
   # Start backend (runs on http://localhost:3000)
   npm run start:backend

   # Start frontend (runs on http://localhost:4200)
   npm run start:frontend

   # Or start both together
   npm start
   ```

## Development Features

### 🧹 Database Cleanup

In development mode, the database is automatically cleaned and seeded with sample data on startup.

**Environment Variables:**

- `SKIP_DB_CLEANUP=true` - Skip automatic database cleanup
- `SKIP_DEV_SEED=true` - Skip development data seeding

### 👤 Default Users

When running in development mode, the following users are automatically created:

**Admin:**

- Email: `admin@admin.com`
- Password: `admin`

**Teachers:**

- Email: `john.doe@school.com` / Password: `teacher123`
- Email: `jane.smith@school.com` / Password: `teacher123`

**Students:**

- Email: `alice.johnson@student.com` / Password: `student123`
- Email: `bob.wilson@student.com` / Password: `student123`
- Email: `charlie.brown@student.com` / Password: `student123`

### 🛠️ Development Endpoints

**Manual Database Cleanup:**

```bash
POST http://localhost:3000/api/dev/cleanup
```

This endpoint will clean the database and reseed it with fresh development data.

### 📁 Project Structure

```
teacher-scheduler/
├── backend/           # NestJS backend API
├── frontend/          # React frontend
├── shared-types/      # Shared TypeScript types
└── frontend-e2e/      # End-to-end tests
```

### 🎨 UI/UX Features

- **Material-UI Design System**: Modern, consistent styling
- **Responsive Layout**: Mobile-first responsive design
- **Enhanced Typography**: Inter font with improved readability
- **Proper Spacing**: Consistent padding and alignment across components
- **Error Handling**: User-friendly error messages with network detection

### 🔧 Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/teacherscheduler
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=3600
NODE_ENV=development
```

### 🚨 Troubleshooting

**"Failed to get data" errors:**

1. Check if MongoDB is running: `mongod`
2. Verify backend is running: `http://localhost:3000/api/health`
3. Check browser console for detailed error messages

**Connection Issues:**

1. Ensure backend is running on port 3000
2. Check CORS configuration in backend
3. Verify environment variables are set correctly

**Database Issues:**

1. Clear and reseed database: `POST http://localhost:3000/api/dev/cleanup`
2. Check MongoDB connection string
3. Verify database permissions

### 📊 Development Workflow

1. **Frontend Development**: Changes to React components auto-reload
2. **Backend Development**: NestJS watches for changes and restarts
3. **Type Safety**: Shared types ensure consistency between frontend/backend
4. **Testing**: Run `npm test` for unit tests, `npm run e2e` for end-to-end tests

### 🎯 Key Features Implemented

- ✅ User authentication (JWT-based)
- ✅ Role-based access control (Admin, Teacher, Student)
- ✅ Material-UI design system
- ✅ Responsive mobile design
- ✅ Development database cleanup
- ✅ Enhanced error handling
- ✅ API health monitoring
- ✅ Automatic development data seeding

---

Happy coding! 🚀
