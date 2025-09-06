# Teacher Scheduler Application

A comprehensive, production-ready teacher scheduling application built with modern web technologies. This application provides a complete solution for managing schedules, users, and administrative tasks in educational environments.

## 🚀 Features

### 📅 Schedule Management

- **Create, Update, Delete Schedules**: Full CRUD operations for schedule management
- **Calendar & List Views**: Multiple viewing options for schedules
- **Conflict Detection**: Prevents double-booking of teachers and rooms
- **Role-based Access**: Different capabilities for admins, teachers, and students
- **Real-time Updates**: Instant schedule updates across users

### 👥 User Management

- **Multi-role System**: Admin, Teacher, and Student roles with appropriate permissions
- **User Profiles**: Comprehensive user profile management
- **Authentication**: Secure JWT-based authentication system
- **Registration**: User registration with email verification

### 🎨 User Interface

- **Modern Design**: Clean, intuitive interface built with Material-UI
- **Responsive**: Mobile-friendly design that works on all devices
- **Dark/Light Theme**: User preference-based theme switching
- **Accessibility**: WCAG 2.1 compliant interface design

### 🔒 Security & Performance

- **Secure Authentication**: JWT tokens with proper expiration
- **Data Validation**: Comprehensive input validation and sanitization
- **Performance Optimized**: Fast loading times and efficient data handling
- **Error Handling**: Comprehensive error handling and user feedback

## 🏗️ Tech Stack

### Frontend

- **React 19** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Material-UI (MUI) v5** - Comprehensive component library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API communication
- **Vite** - Fast build tool and development server

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

### Development Tools

- **Nx** - Monorepo build system and development tools
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **Jest** - Unit and integration testing
- **Playwright** - End-to-end testing

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 6.0+ (local or cloud instance)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/teacher-scheduler.git
cd teacher-scheduler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create environment files:

#### Backend Environment (`.env`)

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/teacher-scheduler
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/teacher-scheduler

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:4200
```

#### Frontend Environment (`.env`)

```bash
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Teacher Scheduler
VITE_APP_VERSION=1.0.0
```

### 4. Start Development Servers

**Important**: Use separate terminals for each service to avoid conflicts:

```bash
# Terminal 1: Backend
npm run start:backend

# Terminal 2: Frontend
npm run start:frontend
```

### 5. Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health

## 🧪 Testing

### Testing Strategy

**Always run tests in separate terminals to avoid port conflicts and ensure proper isolation.**

#### Unit & Integration Tests

```bash
# Terminal 1: Frontend tests
npm run test:frontend

# Terminal 2: Backend tests
npm run test:backend
```

#### End-to-End Tests

```bash
# Terminal 1: Start frontend
npm run start:frontend

# Terminal 2: Start backend
npm run start:backend

# Terminal 3: Run E2E tests
npm run test:e2e
```

#### Test Coverage

```bash
# Generate coverage reports
npm run test:coverage:frontend
npm run test:coverage:backend
```

#### Watch Mode (Development)

```bash
# Run tests in watch mode for active development
npm run test:frontend -- --watch
npm run test:backend -- --watch
```

### Test Scripts Summary

```bash
# All tests (sequential execution to avoid conflicts)
npm run test:all

# Individual test suites
npm run test:frontend    # React component and utility tests
npm run test:backend     # API endpoint and service tests
npm run test:e2e         # Full user workflow tests

# Coverage reports
npm run test:coverage    # Combined coverage
npm run test:coverage:frontend
npm run test:coverage:backend
```

## 🏗️ Development

### Code Quality

```bash
# Linting
npm run lint          # Check for linting issues
npm run lint:fix      # Fix auto-fixable linting issues

# Formatting
npm run format        # Format code with Prettier
npm run format:check  # Check if code is properly formatted

# Type checking
npm run type-check    # TypeScript type checking
```

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Build individually
npm run build:frontend
npm run build:backend

# Preview production build
npm run preview:frontend
```

## 🗂️ Project Structure

```
teacher-scheduler/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-specific pages
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API service functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── index.html           # HTML template
├── backend/                  # Express.js backend API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── tests/           # Test files
│   └── docs/                # API documentation
├── shared-types/             # Shared TypeScript interfaces
├── frontend-e2e/             # End-to-end tests
├── docs/                     # Project documentation
├── .github/                  # GitHub workflows and templates
└── tools/                    # Build tools and scripts
```

## 📚 Documentation

### Comprehensive Guides

- **[Architecture](./docs/ARCHITECTURE.md)** - System design and technical architecture
- **[API Documentation](./backend/docs/api.md)** - Complete API reference
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Testing Guide](./docs/TESTING.md)** - Comprehensive testing strategies
- **[Contributing](./CONTRIBUTING.md)** - Development guidelines and contribution process

### Quick Links

- **[GitHub Instructions](./.github/copilot-instructions.md)** - Project development standards
- **[Environment Setup](#environment-setup)** - Development environment configuration
- **[Testing Strategy](#testing)** - Testing approach and best practices

## 🔒 Security

### Authentication & Authorization

- JWT-based authentication with secure token management
- Role-based access control (Admin, Teacher, Student)
- Password hashing with bcrypt (12 salt rounds)
- Secure session management

### Data Protection

- Input validation and sanitization
- CORS configuration for cross-origin requests
- Rate limiting for API endpoints
- Security headers with Helmet.js

## 🚀 Deployment

### Development

```bash
npm run start  # Starts both frontend and backend
```

### Production

```bash
npm run build  # Build for production
npm run start:backend:prod  # Start production backend
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

For detailed deployment instructions, see [Deployment Guide](./docs/DEPLOYMENT.md).

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for:

- Development setup instructions
- Coding standards and best practices
- Pull request process
- Testing requirements
- Issue reporting guidelines

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Run tests in separate terminals: `npm run test:frontend` and `npm run test:backend`
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📊 Performance

### Frontend Performance

- Bundle size optimization with Vite
- Lazy loading for routes and components
- React component memoization
- Efficient state management

### Backend Performance

- Database connection pooling
- Query optimization with proper indexing
- Response caching for static data
- Compression for API responses

## 🆘 Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Check if ports are in use
netstat -ano | findstr :3000  # Backend
netstat -ano | findstr :4200  # Frontend

# Kill processes if needed
taskkill /PID <PID> /F
```

#### Database Connection

```bash
# Check MongoDB status
mongosh "mongodb://localhost:27017/teacher-scheduler"

# Verify environment variables
echo %MONGODB_URI%
```

#### Test Failures

- **Always run tests in separate terminals**
- Clear node_modules and reinstall if issues persist
- Check that all services are running before E2E tests

### Getting Help

- Check existing [GitHub Issues](https://github.com/your-org/teacher-scheduler/issues)
- Review [Documentation](./docs/)
- Create a new issue with detailed information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Nx](https://nx.dev/) for monorepo management
- UI components from [Material-UI](https://mui.com/)
- Icons from [Material Icons](https://material.io/icons/)
- Testing with [Jest](https://jestjs.io/) and [Playwright](https://playwright.dev/)

---

**Developed with ❤️ for educational institutions worldwide**

For detailed technical information, please refer to our [comprehensive documentation](./docs/) and [API reference](./backend/docs/api.md).
