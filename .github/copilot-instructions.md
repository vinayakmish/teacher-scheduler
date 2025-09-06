# Teacher Scheduler Application - GitHub Instructions

This is a comprehensive production-ready teacher scheduler application built with Nx monorepo structure: React (frontend), Node.js/Express (backend), TypeScript, and end-to-end testing.

## 🎯 Development Guidelines

### Core Architecture

- **Monorepo Structure**: Nx workspace with separate frontend, backend, shared-types, and e2e projects
- **Tech Stack**: React + MUI, Node.js/Express, TypeScript, PostgreSQL/MongoDB
- **Testing**: Jest (unit/integration), Playwright (e2e) - **Always run tests in separate terminals**

## 📋 Essential Features Checklist

### ✅ User Management & Authentication

- [x] Multi-role system (Teacher, Student, Admin)
- [x] JWT-based authentication
- [x] Password hashing with bcrypt
- [ ] Email verification
- [ ] Password reset functionality

### ✅ Scheduling Core Features

- [x] Create, update, delete schedules
- [x] Calendar and list views
- [x] User dashboard with upcoming schedules
- [ ] Recurring events support
- [ ] Conflict detection (double-booking prevention)
- [ ] Time zone handling
- [ ] Waitlist management

### ✅ Administrative Features

- [x] Admin dashboard with statistics
- [x] User management
- [ ] Reporting and analytics
- [ ] Audit logs
- [ ] Data import/export (CSV)

### 🔔 Notifications & Communication

- [ ] Email notifications for schedule changes
- [ ] In-app notifications
- [ ] Calendar reminders
- [ ] Bulk communication tools

### 🎨 User Experience

- [x] Responsive design with Material-UI
- [x] Dark/light theme support
- [x] Accessible UI components
- [ ] Mobile-optimized views
- [ ] Real-time updates

## 🏗️ Development Workflow

### Testing Strategy (**IMPORTANT: Use Separate Terminals**)

```bash
# Terminal 1: Frontend tests
npm run nx test frontend

# Terminal 2: Backend tests
npm run nx test backend

# Terminal 3: E2E tests (after serving apps)
npm run nx serve frontend  # Start frontend first
npm run nx serve backend   # Then backend
npm run nx e2e frontend-e2e # Run e2e in separate terminal
```

### Code Quality Standards

- **Linting**: ESLint with strict TypeScript rules
- **Formatting**: Prettier with consistent configuration
- **Type Safety**: Strict TypeScript compilation
- **Testing**: Minimum 80% code coverage
- **Documentation**: TSDoc for all public APIs

### Git Workflow

- **Branch Strategy**: `feature/description`, `fix/issue-number`, `hotfix/critical-fix`
- **Commit Format**: Conventional commits (feat:, fix:, docs:, etc.)
- **Pull Requests**: Required for all changes to main branch
- **Code Review**: Minimum one reviewer for all PRs

## 🔒 Security Requirements

### Authentication & Authorization

- [x] JWT tokens with proper expiration
- [x] Role-based access control (RBAC)
- [ ] API rate limiting
- [ ] Input validation and sanitization
- [ ] CORS configuration
- [ ] Helmet.js security headers

### Data Protection

- [x] Password hashing (bcrypt)
- [ ] Data encryption for sensitive information
- [ ] Secure session management
- [ ] SQL injection prevention
- [ ] XSS protection

## 🚀 Deployment & Production

### Environment Management

```bash
# Development
npm run nx serve frontend
npm run nx serve backend

# Production Build
npm run nx build frontend
npm run nx build backend

# Testing
npm run test:all  # Custom script for all tests in sequence
```

### Docker Configuration

- **Frontend**: Nginx + React build
- **Backend**: Node.js Alpine image
- **Database**: PostgreSQL official image
- **Orchestration**: Docker Compose for local development

### CI/CD Pipeline

- **GitHub Actions**: Automated testing on PR
- **Deployment**: Automated staging deployment
- **Monitoring**: Application performance monitoring
- **Backup**: Database backup automation

## 📊 Database Design

### Core Entities

- **Users**: Authentication and basic profile
- **Teachers**: Extended teacher information
- **Students**: Student-specific data
- **Schedules**: Core scheduling entity
- **Rooms**: Physical/virtual meeting spaces
- **Classes**: Subject/course information

### Performance Optimization

- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization
- Caching strategy for static data

## 🛠️ API Design Standards

### RESTful Endpoints

```
/api/v1/auth/*          # Authentication
/api/v1/users/*         # User management
/api/v1/schedules/*     # Schedule operations
/api/v1/teachers/*      # Teacher-specific endpoints
/api/v1/students/*      # Student-specific endpoints
/api/v1/admin/*         # Administrative functions
```

### Response Format

- Consistent JSON structure
- Proper HTTP status codes
- Descriptive error messages
- Pagination for list endpoints

## 📈 Performance Standards

### Frontend Performance

- Bundle size optimization
- Lazy loading for routes
- Image optimization
- Caching strategies

### Backend Performance

- Response time < 200ms for most endpoints
- Database query optimization
- Connection pooling
- Memory usage monitoring

## 🧪 Testing Requirements

### Unit Tests

- All business logic functions
- React component testing with RTL
- Service layer testing
- Utility function coverage

### Integration Tests

- API endpoint testing
- Database integration
- Authentication flows
- Third-party service mocks

### E2E Tests

- Critical user journeys
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility compliance

## 📚 Documentation Standards

### Code Documentation

- TSDoc for all public APIs
- README files for each package
- Architecture decision records (ADRs)
- Setup and deployment guides

### API Documentation

- OpenAPI/Swagger specification
- Interactive API explorer
- Example requests/responses
- Authentication guide

## 🎯 Success Metrics

### Technical Metrics

- Test coverage > 80%
- Build time < 5 minutes
- Zero critical security vulnerabilities
- Performance budget compliance

### User Experience Metrics

- Page load time < 3 seconds
- Mobile usability score > 95
- Accessibility compliance (WCAG 2.1)
- User satisfaction > 4.0/5.0

---

## 🚦 Current Project Status

### Completed ✅

- Basic authentication system
- User dashboard with role-based views
- Schedule CRUD operations
- Responsive UI with dark/light themes
- Admin dashboard with statistics
- Basic testing setup

### In Progress 🔄

- Enhanced security measures
- Comprehensive test coverage
- Performance optimization
- Documentation completion

### Planned 📅

- Advanced scheduling features
- Notification system
- Mobile application
- Advanced reporting
- Third-party integrations

---

**Note**: This application follows modern web development best practices and is designed for scalability and maintainability. Always run tests in separate terminals to avoid conflicts and ensure proper isolation.
