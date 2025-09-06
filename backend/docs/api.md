# API Documentation - Teacher Scheduler

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.your-domain.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. Register or login to receive a JWT token
2. Include the token in all subsequent requests
3. Token expires after 24 hours (configurable)

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Endpoints

### Authentication

#### Register User

```http
POST /auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "teacher", // "admin" | "teacher" | "student"
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64a8b12c3d4e5f6789012345",
      "email": "user@example.com",
      "role": "teacher",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64a8b12c3d4e5f6789012345",
      "email": "user@example.com",
      "role": "teacher"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User

```http
GET /auth/me
```

_Requires authentication_

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a8b12c3d4e5f6789012345",
    "email": "user@example.com",
    "role": "teacher",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890"
    }
  }
}
```

#### Logout

```http
POST /auth/logout
```

_Requires authentication_

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Users Management

#### List Users

```http
GET /users?page=1&limit=10&role=teacher&search=john
```

_Requires authentication (admin only)_

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `role` (optional): Filter by role ("admin", "teacher", "student")
- `search` (optional): Search by name or email

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a8b12c3d4e5f6789012345",
      "email": "teacher@example.com",
      "role": "teacher",
      "profile": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2023-07-08T10:30:00Z",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get User Details

```http
GET /users/:id
```

_Requires authentication_

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a8b12c3d4e5f6789012345",
    "email": "teacher@example.com",
    "role": "teacher",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "department": "Mathematics",
      "bio": "Experienced math teacher"
    },
    "createdAt": "2023-07-08T10:30:00Z",
    "lastLogin": "2023-07-10T15:45:00Z"
  }
}
```

#### Update User

```http
PUT /users/:id
```

_Requires authentication (self or admin)_

**Request Body:**

```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890",
    "department": "Mathematics"
  }
}
```

#### Delete User

```http
DELETE /users/:id
```

_Requires authentication (admin only)_

---

### Schedules

#### List Schedules

```http
GET /schedules?page=1&limit=10&teacherId=123&date=2023-07-10&status=active
```

_Requires authentication_

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `teacherId` (optional): Filter by teacher ID
- `studentId` (optional): Filter by student ID
- `date` (optional): Filter by date (YYYY-MM-DD)
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)
- `status` (optional): Filter by status ("active", "cancelled", "completed")

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a8b12c3d4e5f6789012346",
      "title": "Mathematics Lesson",
      "description": "Algebra fundamentals",
      "teacherId": "64a8b12c3d4e5f6789012345",
      "teacher": {
        "_id": "64a8b12c3d4e5f6789012345",
        "profile": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "studentId": "64a8b12c3d4e5f6789012347",
      "student": {
        "_id": "64a8b12c3d4e5f6789012347",
        "profile": {
          "firstName": "Jane",
          "lastName": "Smith"
        }
      },
      "startTime": "2023-07-10T14:00:00Z",
      "endTime": "2023-07-10T15:00:00Z",
      "status": "active",
      "createdAt": "2023-07-08T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Create Schedule

```http
POST /schedules
```

_Requires authentication (teacher or admin)_

**Request Body:**

```json
{
  "title": "Mathematics Lesson",
  "description": "Algebra fundamentals",
  "teacherId": "64a8b12c3d4e5f6789012345",
  "startTime": "2023-07-10T14:00:00Z",
  "endTime": "2023-07-10T15:00:00Z",
  "roomId": "64a8b12c3d4e5f6789012348"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a8b12c3d4e5f6789012346",
    "title": "Mathematics Lesson",
    "description": "Algebra fundamentals",
    "teacherId": "64a8b12c3d4e5f6789012345",
    "startTime": "2023-07-10T14:00:00Z",
    "endTime": "2023-07-10T15:00:00Z",
    "status": "active",
    "createdAt": "2023-07-08T10:30:00Z"
  }
}
```

#### Get Schedule Details

```http
GET /schedules/:id
```

_Requires authentication_

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "64a8b12c3d4e5f6789012346",
    "title": "Mathematics Lesson",
    "description": "Algebra fundamentals",
    "teacher": {
      "_id": "64a8b12c3d4e5f6789012345",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "department": "Mathematics"
      }
    },
    "student": {
      "_id": "64a8b12c3d4e5f6789012347",
      "profile": {
        "firstName": "Jane",
        "lastName": "Smith"
      }
    },
    "startTime": "2023-07-10T14:00:00Z",
    "endTime": "2023-07-10T15:00:00Z",
    "status": "active",
    "room": {
      "_id": "64a8b12c3d4e5f6789012348",
      "name": "Room 101",
      "location": "Building A"
    },
    "createdAt": "2023-07-08T10:30:00Z",
    "updatedAt": "2023-07-08T10:30:00Z"
  }
}
```

#### Update Schedule

```http
PUT /schedules/:id
```

_Requires authentication (creator, assigned teacher, or admin)_

**Request Body:**

```json
{
  "title": "Advanced Mathematics",
  "description": "Advanced algebra topics",
  "startTime": "2023-07-10T15:00:00Z",
  "endTime": "2023-07-10T16:00:00Z"
}
```

#### Cancel/Delete Schedule

```http
DELETE /schedules/:id
```

_Requires authentication (creator, assigned teacher, or admin)_

**Response:**

```json
{
  "success": true,
  "message": "Schedule cancelled successfully"
}
```

#### Enroll Student

```http
POST /schedules/:id/enroll
```

_Requires authentication (student or admin)_

**Request Body:**

```json
{
  "studentId": "64a8b12c3d4e5f6789012347"
}
```

#### Unenroll Student

```http
DELETE /schedules/:id/unenroll
```

_Requires authentication (enrolled student or admin)_

---

### Analytics (Admin Only)

#### Dashboard Statistics

```http
GET /analytics/dashboard
```

_Requires authentication (admin only)_

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalTeachers": 25,
    "totalStudents": 120,
    "totalSchedules": 500,
    "activeSchedules": 75,
    "schedulesToday": 12,
    "schedulesTomorrow": 18,
    "recentActivity": [
      {
        "type": "schedule_created",
        "message": "New schedule created by John Doe",
        "timestamp": "2023-07-10T10:30:00Z"
      }
    ]
  }
}
```

#### Schedule Analytics

```http
GET /analytics/schedules?period=week&teacherId=123
```

_Requires authentication (admin only)_

**Query Parameters:**

- `period` (optional): "day", "week", "month", "year" (default: "week")
- `teacherId` (optional): Filter by specific teacher
- `startDate` (optional): Custom date range start
- `endDate` (optional): Custom date range end

**Response:**

```json
{
  "success": true,
  "data": {
    "period": "week",
    "totalSchedules": 45,
    "completedSchedules": 40,
    "cancelledSchedules": 3,
    "activeSchedules": 2,
    "schedulesByDay": [
      {
        "date": "2023-07-10",
        "count": 8
      }
    ],
    "topTeachers": [
      {
        "teacherId": "64a8b12c3d4e5f6789012345",
        "name": "John Doe",
        "scheduleCount": 15
      }
    ]
  }
}
```

---

### Rooms

#### List Rooms

```http
GET /rooms?available=true&capacity=20
```

_Requires authentication_

**Query Parameters:**

- `available` (optional): Filter by availability
- `capacity` (optional): Minimum capacity required
- `equipment` (optional): Required equipment (comma-separated)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a8b12c3d4e5f6789012348",
      "name": "Room 101",
      "location": "Building A, First Floor",
      "capacity": 30,
      "equipment": ["projector", "whiteboard", "computer"],
      "isActive": true
    }
  ]
}
```

#### Create Room

```http
POST /rooms
```

_Requires authentication (admin only)_

**Request Body:**

```json
{
  "name": "Room 102",
  "location": "Building A, Second Floor",
  "capacity": 25,
  "equipment": ["projector", "whiteboard"]
}
```

---

## Error Codes

| Code                  | Description                                |
| --------------------- | ------------------------------------------ |
| `VALIDATION_ERROR`    | Request validation failed                  |
| `UNAUTHORIZED`        | Authentication required                    |
| `FORBIDDEN`           | Insufficient permissions                   |
| `NOT_FOUND`           | Resource not found                         |
| `CONFLICT`            | Resource conflict (e.g., schedule overlap) |
| `RATE_LIMIT_EXCEEDED` | Too many requests                          |
| `INTERNAL_ERROR`      | Server error                               |

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Admin endpoints**: 200 requests per 15 minutes per authenticated user

## Webhooks (Future Feature)

### Schedule Events

```http
POST https://your-app.com/webhook/schedule-created
Content-Type: application/json

{
  "event": "schedule.created",
  "data": {
    "scheduleId": "64a8b12c3d4e5f6789012346",
    "teacherId": "64a8b12c3d4e5f6789012345",
    "startTime": "2023-07-10T14:00:00Z"
  },
  "timestamp": "2023-07-08T10:30:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
const API_BASE = 'http://localhost:3000/api';

class TeacherSchedulerAPI {
  private token: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      this.token = data.data.token;
    }
    return data;
  }

  async getSchedules(params?: any) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/schedules?${queryString}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    return response.json();
  }

  async createSchedule(scheduleData: any) {
    const response = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(scheduleData),
    });

    return response.json();
  }
}
```

### cURL Examples

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "password123"
  }'
```

#### Create Schedule

```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Math Lesson",
    "teacherId": "64a8b12c3d4e5f6789012345",
    "startTime": "2023-07-10T14:00:00Z",
    "endTime": "2023-07-10T15:00:00Z"
  }'
```

---

For more examples and detailed integration guides, see the [Integration Examples](./INTEGRATION.md) document.
