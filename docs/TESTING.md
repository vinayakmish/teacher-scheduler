# Testing Guide - Teacher Scheduler

## Overview

This guide provides comprehensive instructions for testing the Teacher Scheduler application. The testing strategy follows the testing pyramid with unit tests, integration tests, and end-to-end tests.

## Testing Philosophy

### Test Pyramid

1. **Unit Tests (70%)**: Fast, isolated tests for individual functions and components
2. **Integration Tests (20%)**: Test API endpoints and service interactions
3. **End-to-End Tests (10%)**: Test complete user workflows

### Testing Principles

- **Arrange, Act, Assert**: Structure tests clearly
- **Test Behavior, Not Implementation**: Focus on what the code does, not how
- **Keep Tests Simple**: One concept per test
- **Fast and Reliable**: Tests should run quickly and consistently

## Test Organization

### Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── UserCard/
│   │   │   ├── UserCard.tsx
│   │   │   ├── UserCard.test.tsx
│   │   │   └── UserCard.stories.tsx
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Dashboard.test.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── api.test.ts
│   └── utils/
│       ├── helpers.ts
│       └── helpers.test.ts

backend/
├── src/
│   ├── controllers/
│   │   ├── schedule.controller.ts
│   │   └── schedule.controller.test.ts
│   ├── services/
│   │   ├── schedule.service.ts
│   │   └── schedule.service.test.ts
│   └── tests/
│       ├── integration/
│       │   ├── auth.test.ts
│       │   └── schedules.test.ts
│       └── setup/
│           ├── database.ts
│           └── testServer.ts
```

## Running Tests

### Important: Use Separate Terminals

**Never run different test suites in the same terminal to avoid conflicts and port issues.**

#### Terminal 1: Frontend Tests

```bash
# Run all frontend tests
npm run nx test frontend

# Run tests in watch mode
npm run nx test frontend -- --watch

# Run specific test file
npm run nx test frontend -- UserCard.test.tsx

# Run tests with coverage
npm run nx test frontend -- --coverage
```

#### Terminal 2: Backend Tests

```bash
# Run all backend tests
npm run nx test backend

# Run tests in watch mode
npm run nx test backend -- --watch

# Run specific test file
npm run nx test backend -- schedule.controller.test.ts

# Run tests with coverage
npm run nx test backend -- --coverage
```

#### Terminal 3: E2E Tests

```bash
# Start the applications first (in separate terminals)
npm run nx serve frontend  # Terminal 4
npm run nx serve backend   # Terminal 5

# Then run E2E tests
npm run nx e2e frontend-e2e

# Run specific E2E test
npm run nx e2e frontend-e2e -- --spec="auth.spec.ts"
```

### All Tests Script

```bash
# Custom script to run all tests sequentially
npm run test:all
```

## Frontend Testing

### Testing Library Setup

#### jest.config.ts (Frontend)

```typescript
export default {
  displayName: 'frontend',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/frontend',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.stories.tsx', '!src/main.tsx'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Test Setup (src/test-setup.ts)

```typescript
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Suppress console.error during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is no longer supported')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
```

### Component Testing Examples

#### Simple Component Test

```typescript
// UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';
import { User } from '../../types/User';

const mockUser: User = {
  _id: '1',
  email: 'john.doe@example.com',
  role: 'teacher',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
  },
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

describe('UserCard', () => {
  it('renders user information', () => {
    render(<UserCard user={mockUser} onEdit={jest.fn()} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Teacher')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });

  it('shows role badge with correct color', () => {
    render(<UserCard user={mockUser} onEdit={jest.fn()} />);

    const roleBadge = screen.getByText('Teacher');
    expect(roleBadge).toHaveClass('MuiChip-colorPrimary');
  });
});
```

#### Form Component Test

```typescript
// ScheduleForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScheduleForm } from './ScheduleForm';

describe('ScheduleForm', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    teachers: [{ _id: '1', profile: { firstName: 'John', lastName: 'Doe' } }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields', () => {
    render(<ScheduleForm {...defaultProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teacher/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<ScheduleForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/title/i), 'Math Lesson');
    await user.type(screen.getByLabelText(/description/i), 'Algebra basics');
    await user.selectOptions(screen.getByLabelText(/teacher/i), '1');

    const submitButton = screen.getByRole('button', { name: /create schedule/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        title: 'Math Lesson',
        description: 'Algebra basics',
        teacherId: '1',
        startTime: expect.any(Date),
        endTime: expect.any(Date),
      });
    });
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(<ScheduleForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /create schedule/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/teacher is required/i)).toBeInTheDocument();
    });

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
});
```

#### Hook Testing

```typescript
// useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

// Mock the API service
jest.mock('../services/api', () => ({
  api: {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with no user', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(true);
  });

  it('logs in user successfully', async () => {
    const mockUser = { _id: '1', email: 'test@example.com', role: 'teacher' };
    const mockApi = require('../services/api').api;
    mockApi.login.mockResolvedValue({ user: mockUser, token: 'fake-token' });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe('fake-token');
  });
});
```

## Backend Testing

### Test Database Setup

#### Test Database Configuration

```typescript
// src/tests/setup/database.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

export const connectTestDB = async (): Promise<void> => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);
};

export const closeTestDB = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

export const clearTestDB = async (): Promise<void> => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
```

#### Test Server Setup

```typescript
// src/tests/setup/testServer.ts
import express from 'express';
import { authRoutes } from '../../routes/auth';
import { scheduleRoutes } from '../../routes/schedules';
import { errorHandler } from '../../middleware/errorHandler';

export const createTestServer = () => {
  const app = express();

  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/schedules', scheduleRoutes);
  app.use(errorHandler);

  return app;
};
```

### Backend Test Examples

#### Controller Tests

```typescript
// schedule.controller.test.ts
import request from 'supertest';
import { createTestServer } from '../tests/setup/testServer';
import { connectTestDB, closeTestDB, clearTestDB } from '../tests/setup/database';
import { User } from '../models/User';
import { generateAuthToken } from '../utils/auth';

const app = createTestServer();

describe('Schedule Controller', () => {
  let teacherToken: string;
  let teacherId: string;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Create test teacher
    const teacher = await User.create({
      email: 'teacher@test.com',
      password: 'hashedpassword',
      role: 'teacher',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    teacherId = teacher._id.toString();
    teacherToken = generateAuthToken(teacher);
  });

  describe('POST /api/schedules', () => {
    const validScheduleData = {
      title: 'Math Lesson',
      description: 'Algebra basics',
      startTime: '2023-07-10T14:00:00Z',
      endTime: '2023-07-10T15:00:00Z',
    };

    it('creates schedule successfully', async () => {
      const response = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ ...validScheduleData, teacherId })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Math Lesson');
      expect(response.body.data.teacherId).toBe(teacherId);
    });

    it('returns 401 without authentication', async () => {
      await request(app).post('/api/schedules').send(validScheduleData).expect(401);
    });

    it('returns 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ title: '' }) // Missing required fields
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('prevents schedule conflicts', async () => {
      // Create first schedule
      await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ ...validScheduleData, teacherId })
        .expect(201);

      // Try to create conflicting schedule
      const conflictingSchedule = {
        ...validScheduleData,
        teacherId,
        startTime: '2023-07-10T14:30:00Z', // Overlaps with first schedule
        endTime: '2023-07-10T15:30:00Z',
      };

      const response = await request(app).post('/api/schedules').set('Authorization', `Bearer ${teacherToken}`).send(conflictingSchedule).expect(409);

      expect(response.body.error.code).toBe('SCHEDULE_CONFLICT');
    });
  });

  describe('GET /api/schedules', () => {
    it('returns paginated schedules', async () => {
      // Create test schedules
      await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ ...validScheduleData, teacherId });

      const response = await request(app).get('/api/schedules?page=1&limit=10').set('Authorization', `Bearer ${teacherToken}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });
  });
});
```

#### Service Tests

```typescript
// schedule.service.test.ts
import { ScheduleService } from './schedule.service';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { UserRepository } from '../repositories/user.repository';

// Mock dependencies
jest.mock('../repositories/schedule.repository');
jest.mock('../repositories/user.repository');

describe('ScheduleService', () => {
  let scheduleService: ScheduleService;
  let mockScheduleRepository: jest.Mocked<ScheduleRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockScheduleRepository = new ScheduleRepository() as jest.Mocked<ScheduleRepository>;
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    scheduleService = new ScheduleService(mockScheduleRepository, mockUserRepository);
  });

  describe('create', () => {
    const validScheduleData = {
      title: 'Math Lesson',
      teacherId: 'teacher123',
      startTime: new Date('2023-07-10T14:00:00Z'),
      endTime: new Date('2023-07-10T15:00:00Z'),
    };

    it('creates schedule successfully', async () => {
      const mockTeacher = { _id: 'teacher123', role: 'teacher' };
      const mockSchedule = { _id: 'schedule123', ...validScheduleData };

      mockUserRepository.findById.mockResolvedValue(mockTeacher);
      mockScheduleRepository.findConflicting.mockResolvedValue([]);
      mockScheduleRepository.create.mockResolvedValue(mockSchedule);

      const result = await scheduleService.create(validScheduleData);

      expect(result).toEqual(mockSchedule);
      expect(mockScheduleRepository.create).toHaveBeenCalledWith(validScheduleData);
    });

    it('throws error for non-existent teacher', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(scheduleService.create(validScheduleData)).rejects.toThrow('Teacher not found');
    });

    it('throws error for schedule conflicts', async () => {
      const mockTeacher = { _id: 'teacher123', role: 'teacher' };
      const conflictingSchedule = { _id: 'conflict123', title: 'Existing Lesson' };

      mockUserRepository.findById.mockResolvedValue(mockTeacher);
      mockScheduleRepository.findConflicting.mockResolvedValue([conflictingSchedule]);

      await expect(scheduleService.create(validScheduleData)).rejects.toThrow('Schedule conflict detected');
    });

    it('validates time range', async () => {
      const invalidData = {
        ...validScheduleData,
        startTime: new Date('2023-07-10T15:00:00Z'),
        endTime: new Date('2023-07-10T14:00:00Z'), // End before start
      };

      await expect(scheduleService.create(invalidData)).rejects.toThrow('End time must be after start time');
    });
  });
});
```

## End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: [
    {
      command: 'npm run nx serve frontend',
      port: 4200,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run nx serve backend',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

### E2E Test Examples

```typescript
// auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can login and logout', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'teacher@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // Submit form
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });
});

// schedule-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Schedule Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'teacher@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('teacher can create a new schedule', async ({ page }) => {
    // Navigate to create schedule
    await page.click('[data-testid="create-schedule-button"]');
    await expect(page).toHaveURL('/schedules/create');

    // Fill schedule form
    await page.fill('[data-testid="title-input"]', 'Math Lesson');
    await page.fill('[data-testid="description-input"]', 'Algebra basics');
    await page.selectOption('[data-testid="teacher-select"]', 'teacher123');

    // Set date and time
    await page.fill('[data-testid="start-time-input"]', '2023-07-10T14:00');
    await page.fill('[data-testid="end-time-input"]', '2023-07-10T15:00');

    // Submit form
    await page.click('[data-testid="submit-button"]');

    // Should show success message and redirect
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Schedule created successfully');
    await expect(page).toHaveURL('/schedules');

    // Verify schedule appears in list
    await expect(page.locator('[data-testid="schedule-list"]')).toContainText('Math Lesson');
  });

  test('prevents creating conflicting schedules', async ({ page }) => {
    // Create first schedule
    await page.click('[data-testid="create-schedule-button"]');
    await page.fill('[data-testid="title-input"]', 'First Lesson');
    await page.selectOption('[data-testid="teacher-select"]', 'teacher123');
    await page.fill('[data-testid="start-time-input"]', '2023-07-10T14:00');
    await page.fill('[data-testid="end-time-input"]', '2023-07-10T15:00');
    await page.click('[data-testid="submit-button"]');

    // Try to create conflicting schedule
    await page.click('[data-testid="create-schedule-button"]');
    await page.fill('[data-testid="title-input"]', 'Conflicting Lesson');
    await page.selectOption('[data-testid="teacher-select"]', 'teacher123');
    await page.fill('[data-testid="start-time-input"]', '2023-07-10T14:30'); // Conflicts
    await page.fill('[data-testid="end-time-input"]', '2023-07-10T15:30');
    await page.click('[data-testid="submit-button"]');

    // Should show conflict error
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Schedule conflict detected');
  });
});
```

## Test Utilities

### Frontend Test Utilities

```typescript
// src/test-utils/render.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import { AuthProvider } from '../contexts/AuthContext';

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Backend Test Utilities

```typescript
// src/test-utils/factories.ts
import { faker } from '@faker-js/faker';
import { User } from '../models/User';
import { Schedule } from '../models/Schedule';

export const createTestUser = async (overrides: Partial<User> = {}) => {
  const userData = {
    email: faker.internet.email(),
    password: 'hashedpassword',
    role: 'teacher' as const,
    profile: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
    },
    ...overrides,
  };

  return User.create(userData);
};

export const createTestSchedule = async (overrides: Partial<Schedule> = {}) => {
  const scheduleData = {
    title: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    teacherId: faker.database.mongodbObjectId(),
    startTime: faker.date.future(),
    endTime: faker.date.future(),
    status: 'active' as const,
    ...overrides,
  };

  return Schedule.create(scheduleData);
};
```

## Performance Testing

### Frontend Performance Tests

```typescript
// src/performance/schedule-list.perf.test.ts
import { render } from '@testing-library/react';
import { ScheduleList } from '../components/ScheduleList';

describe('ScheduleList Performance', () => {
  it('renders large list efficiently', () => {
    const largeScheduleList = Array.from({ length: 1000 }, (_, i) => ({
      _id: `schedule-${i}`,
      title: `Schedule ${i}`,
      teacherId: `teacher-${i}`,
      startTime: new Date(),
      endTime: new Date(),
      status: 'active' as const,
    }));

    const startTime = performance.now();
    render(<ScheduleList schedules={largeScheduleList} />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
  });
});
```

## Test Coverage Reports

### Generating Coverage Reports

```bash
# Frontend coverage
npm run nx test frontend -- --coverage

# Backend coverage
npm run nx test backend -- --coverage

# Combined coverage report
npm run test:coverage
```

### Coverage Thresholds

The project maintains minimum coverage thresholds:

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Configuration

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "./src/components/": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

---

Remember: Always run tests in separate terminals to avoid conflicts and ensure reliable test execution!
