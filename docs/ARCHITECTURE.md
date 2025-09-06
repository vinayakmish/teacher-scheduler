# Teacher Scheduler - System Architecture

## Overview

This teacher scheduler application is built as an Nx monorepo with a clear separation of concerns across frontend, backend, and shared components. The architecture follows modern web development best practices with TypeScript throughout.

## Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Context + Hooks
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

### Backend

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi or Zod
- **Testing**: Jest + Supertest

### Shared

- **Type Definitions**: Shared TypeScript interfaces
- **Utilities**: Common validation and utility functions
- **Constants**: Shared enums and constants

## Project Structure

```
teacher-scheduler/
├── apps/
│   ├── frontend/           # React application
│   ├── backend/            # Express.js API
│   └── frontend-e2e/       # End-to-end tests
├── libs/
│   └── shared-types/       # Shared TypeScript definitions
├── docs/                   # Documentation
├── tools/                  # Custom scripts and tools
└── .github/               # GitHub workflows and templates
```

## Data Architecture

### Core Entities

```typescript
interface User {
  _id: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'teacher' | 'student';
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

interface Schedule {
  _id: string;
  teacherId: string;
  studentId?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'cancelled' | 'completed';
  roomId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Room {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  equipment: string[];
  isActive: boolean;
}
```

### Database Relationships

- **Users** have **Profiles** (one-to-one)
- **Teachers** can have many **Schedules** (one-to-many)
- **Students** can be enrolled in many **Schedules** (many-to-many)
- **Schedules** may be assigned to **Rooms** (many-to-one)

## API Design

### REST Endpoints

#### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Users Management

- `GET /api/users` - List users (admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

#### Schedules

- `GET /api/schedules` - List schedules with filters
- `POST /api/schedules` - Create new schedule
- `GET /api/schedules/:id` - Get schedule details
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Cancel/delete schedule
- `POST /api/schedules/:id/enroll` - Student enrollment
- `DELETE /api/schedules/:id/unenroll` - Student unenrollment

#### Analytics (Admin)

- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/schedules` - Schedule analytics
- `GET /api/analytics/users` - User activity analytics

## Security Architecture

### Authentication Flow

1. User submits credentials to `/api/auth/login`
2. Server validates credentials and returns JWT token
3. Client stores token in localStorage/sessionStorage
4. Client includes token in Authorization header for protected routes
5. Server validates token on each protected request

### Authorization Levels

- **Public**: Registration, login pages
- **Authenticated**: Dashboard, profile management
- **Teacher**: Schedule creation and management
- **Admin**: User management, system analytics

### Security Measures

- Password hashing with bcrypt (salt rounds: 12)
- JWT tokens with expiration (24 hours)
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Rate limiting for API endpoints
- Helmet.js for security headers

## Frontend Architecture

### Component Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout/          # App shell components
│   ├── Forms/           # Form components
│   └── Common/          # Generic components
├── pages/               # Route-specific pages
│   ├── Auth/           # Login, register
│   ├── Dashboard/      # Role-specific dashboards
│   └── Schedule/       # Schedule management
├── contexts/           # React contexts for state
├── services/           # API service functions
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### State Management Strategy

- **Global State**: User authentication, theme preferences
- **Local State**: Form data, component-specific state
- **Server State**: API data with React Query (future enhancement)

## Backend Architecture

### Middleware Stack

1. **CORS**: Cross-origin resource sharing
2. **Helmet**: Security headers
3. **Body Parser**: JSON/URL-encoded parsing
4. **Authentication**: JWT token validation
5. **Validation**: Request data validation
6. **Error Handling**: Centralized error processing
7. **Logging**: Request/response logging

### Service Layer Pattern

```typescript
// Controller handles HTTP concerns
export class ScheduleController {
  async createSchedule(req: Request, res: Response) {
    const schedule = await this.scheduleService.create(req.body);
    res.json({ success: true, data: schedule });
  }
}

// Service handles business logic
export class ScheduleService {
  async create(data: CreateScheduleDto): Promise<Schedule> {
    // Validation, conflict checking, etc.
    return this.scheduleRepository.save(data);
  }
}

// Repository handles data access
export class ScheduleRepository {
  async save(data: Schedule): Promise<Schedule> {
    return ScheduleModel.create(data);
  }
}
```

## Testing Strategy

### Unit Tests

- **Frontend**: Component testing with React Testing Library
- **Backend**: Service and utility function testing
- **Shared**: Type validation and utility testing

### Integration Tests

- **API Testing**: Full request/response cycle testing
- **Database Testing**: Repository layer testing with test database

### End-to-End Tests

- **User Journeys**: Complete workflows from login to task completion
- **Cross-browser**: Chrome, Firefox, Safari compatibility
- **Mobile**: Responsive design validation

## Performance Considerations

### Frontend Optimization

- **Code Splitting**: Route-based code splitting with React.lazy
- **Bundle Analysis**: Regular bundle size monitoring
- **Memoization**: React.memo and useMemo for expensive operations
- **Image Optimization**: Lazy loading and modern formats

### Backend Optimization

- **Database Indexing**: Proper indexes on frequently queried fields
- **Connection Pooling**: MongoDB connection pool configuration
- **Caching**: Redis for session and frequently accessed data
- **Compression**: Gzip compression for API responses

## Deployment Architecture

### Development Environment

- **Frontend**: Vite dev server (http://localhost:4200)
- **Backend**: Express with nodemon (http://localhost:3000)
- **Database**: Local MongoDB instance

### Production Environment

- **Frontend**: Static files served by Nginx
- **Backend**: Node.js application with PM2 process manager
- **Database**: MongoDB Atlas or self-hosted MongoDB cluster
- **Reverse Proxy**: Nginx for SSL termination and load balancing

### CI/CD Pipeline

1. **Code Commit**: Push to feature branch
2. **Automated Testing**: Run all test suites
3. **Code Quality**: ESLint, Prettier, type checking
4. **Build**: Create production builds
5. **Deploy Staging**: Automatic deployment to staging environment
6. **Manual QA**: Human testing in staging
7. **Deploy Production**: Manual approval for production deployment

## Scalability Considerations

### Horizontal Scaling

- **Load Balancing**: Multiple backend instances behind load balancer
- **Database Sharding**: MongoDB sharding for large datasets
- **CDN**: Content delivery network for static assets

### Monitoring and Logging

- **Application Monitoring**: Performance metrics and error tracking
- **Database Monitoring**: Query performance and resource usage
- **Log Aggregation**: Centralized logging with structured logs

## Future Enhancements

### Phase 2 Features

- Real-time notifications with WebSockets
- Calendar integration (Google Calendar, Outlook)
- Mobile application (React Native)
- Advanced reporting and analytics

### Phase 3 Features

- Video conferencing integration
- Automated scheduling suggestions
- Multi-tenant support for multiple schools
- Advanced conflict resolution

---

This architecture document should be updated as the application evolves and new requirements are identified.
