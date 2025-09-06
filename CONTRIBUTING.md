# Contributing to Teacher Scheduler

Thank you for your interest in contributing to the Teacher Scheduler application! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Issue Reporting](#issue-reporting)
8. [Documentation](#documentation)

## Code of Conduct

This project follows a Code of Conduct to ensure a welcoming environment for all contributors:

- **Be respectful**: Treat all community members with respect and kindness
- **Be inclusive**: Welcome people of all backgrounds and skill levels
- **Be patient**: Help others learn and grow
- **Be constructive**: Provide helpful feedback and suggestions
- **Be professional**: Maintain professional communication

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- MongoDB (local or cloud instance)
- Basic knowledge of React, TypeScript, and Node.js

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/teacher-scheduler.git
cd teacher-scheduler
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/teacher-scheduler.git
```

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create environment files:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

Edit the `.env` files with your local configuration.

### 3. Start Development Servers

**Important**: Always run tests in separate terminals to avoid conflicts.

```bash
# Terminal 1: Backend
npm run nx serve backend

# Terminal 2: Frontend
npm run nx serve frontend

# Terminal 3: Tests (when needed)
npm run nx test backend
# or
npm run nx test frontend
```

### 4. Verify Setup

- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- Backend Health Check: http://localhost:3000/api/health

## Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` type - use proper typing

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

function getUser(id: string): Promise<User | null> {
  // implementation
}

// Avoid
function getUser(id: any): any {
  // implementation
}
```

### React Component Guidelines

- Use functional components with hooks
- Implement proper prop typing
- Use memo for performance optimization when needed
- Follow the single responsibility principle

```typescript
// Good
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = React.memo(({ user, onEdit }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{user.email}</Typography>
        <Button onClick={() => onEdit(user)}>Edit</Button>
      </CardContent>
    </Card>
  );
});
```

### Backend Guidelines

- Follow MVC pattern: Controllers → Services → Repositories
- Use proper error handling with try-catch blocks
- Implement input validation for all endpoints
- Use middleware for cross-cutting concerns

```typescript
// Good - Controller
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  async createSchedule(req: Request, res: Response): Promise<void> {
    try {
      const schedule = await this.scheduleService.create(req.body);
      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

// Good - Service
export class ScheduleService {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async create(data: CreateScheduleDto): Promise<Schedule> {
    await this.validateScheduleData(data);
    await this.checkConflicts(data);
    return this.scheduleRepository.save(data);
  }
}
```

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`, `schedule-card.tsx`)
- **Components**: PascalCase (`UserCard`, `ScheduleList`)
- **Variables/Functions**: camelCase (`getUserById`, `scheduleData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `DEFAULT_PAGE_SIZE`)
- **Interfaces**: PascalCase with descriptive names (`User`, `CreateScheduleDto`)

### ESLint and Prettier

The project uses ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Testing Guidelines

### Testing Strategy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and service interactions
- **E2E Tests**: Test complete user workflows

### Running Tests

**Always use separate terminals for different test suites:**

```bash
# Terminal 1: Frontend unit tests
npm run nx test frontend

# Terminal 2: Backend unit tests
npm run nx test backend

# Terminal 3: E2E tests (after starting dev servers)
npm run nx e2e frontend-e2e
```

### Writing Tests

#### Frontend Component Tests

```typescript
// UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    role: 'teacher' as const,
  };

  it('renders user email', () => {
    render(<UserCard user={mockUser} onEdit={jest.fn()} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

#### Backend API Tests

```typescript
// schedule.test.ts
import request from 'supertest';
import { app } from '../app';

describe('Schedule API', () => {
  let authToken: string;

  beforeEach(async () => {
    // Setup test data and authentication
    const loginResponse = await request(app).post('/api/auth/login').send({ email: 'teacher@test.com', password: 'password' });

    authToken = loginResponse.body.data.token;
  });

  describe('POST /schedules', () => {
    it('creates a new schedule', async () => {
      const scheduleData = {
        title: 'Math Lesson',
        teacherId: 'teacher123',
        startTime: '2023-07-10T14:00:00Z',
        endTime: '2023-07-10T15:00:00Z',
      };

      const response = await request(app).post('/api/schedules').set('Authorization', `Bearer ${authToken}`).send(scheduleData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Math Lesson');
    });

    it('returns 400 for invalid data', async () => {
      const invalidData = { title: '' }; // Missing required fields

      await request(app).post('/api/schedules').set('Authorization', `Bearer ${authToken}`).send(invalidData).expect(400);
    });
  });
});
```

### Test Coverage

- Maintain minimum 80% test coverage
- Focus on critical business logic
- Test error conditions and edge cases
- Use meaningful test descriptions

## Pull Request Process

### 1. Create Feature Branch

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following the coding standards
- Add tests for new functionality
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run all tests in separate terminals
npm run nx test frontend
npm run nx test backend
npm run nx e2e frontend-e2e

# Check linting and formatting
npm run lint
npm run format
```

### 4. Commit Changes

Use conventional commit format:

```bash
git add .
git commit -m "feat: add schedule conflict detection"
# or
git commit -m "fix: resolve authentication token expiry issue"
# or
git commit -m "docs: update API documentation"
```

**Commit Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create a Pull Request on GitHub with:

- Clear title and description
- Link to related issues
- Screenshots for UI changes
- Test instructions

### 6. PR Review Process

- Automated tests must pass
- Code review by at least one maintainer
- Address review feedback promptly
- Rebase/squash commits if requested

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Clear Description**: What happened vs. what was expected
2. **Steps to Reproduce**: Detailed steps to recreate the issue
3. **Environment**: OS, browser version, Node.js version
4. **Screenshots**: For UI issues
5. **Console Logs**: Any error messages

**Bug Report Template:**

```markdown
**Bug Description**
A clear and concise description of the bug.

**Steps to Reproduce**

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**

- OS: [e.g. Windows 10, macOS 12]
- Browser: [e.g. Chrome 91, Safari 14]
- Node.js: [e.g. 18.16.0]

**Additional Context**
Any other context about the problem.
```

### Feature Requests

For feature requests, include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other solutions considered
4. **Use Cases**: Who would benefit from this?

## Documentation

### Code Documentation

- Use TSDoc comments for public APIs
- Document complex business logic
- Include examples for utility functions

````typescript
/**
 * Checks if two schedules have conflicting time slots
 * @param schedule1 - First schedule to compare
 * @param schedule2 - Second schedule to compare
 * @returns True if schedules conflict, false otherwise
 *
 * @example
 * ```typescript
 * const conflict = hasScheduleConflict(
 *   { startTime: new Date('2023-07-10T14:00:00Z'), endTime: new Date('2023-07-10T15:00:00Z') },
 *   { startTime: new Date('2023-07-10T14:30:00Z'), endTime: new Date('2023-07-10T15:30:00Z') }
 * );
 * console.log(conflict); // true
 * ```
 */
export function hasScheduleConflict(schedule1: Schedule, schedule2: Schedule): boolean {
  // implementation
}
````

### README Updates

When adding new features or making significant changes:

- Update installation instructions if needed
- Add new environment variables to documentation
- Update API examples
- Document new CLI commands or scripts

### API Documentation

- Update OpenAPI/Swagger specs for new endpoints
- Include request/response examples
- Document error codes and messages
- Keep examples current and working

## Release Process

### Version Management

The project follows [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH` (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Database migrations tested
- [ ] Performance impact assessed
- [ ] Security review completed

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Discord/Slack**: Real-time chat (if available)

### Resources

- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Material-UI Documentation](https://mui.com/getting-started/installation/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Nx Documentation](https://nx.dev/getting-started/intro)

### Mentorship

New contributors are welcome! If you're new to the project:

- Start with "good first issue" labels
- Ask questions in discussions
- Request code review feedback
- Pair programming sessions available

---

Thank you for contributing to Teacher Scheduler! Your efforts help make this project better for everyone.
