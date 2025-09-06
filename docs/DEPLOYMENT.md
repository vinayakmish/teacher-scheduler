# Deployment Guide - Teacher Scheduler Application

This guide provides step-by-step instructions for deploying the Teacher Scheduler application to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Production Considerations](#production-considerations)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

### System Requirements

- Node.js 18+ and npm/yarn
- Docker and Docker Compose (for containerized deployment)
- MongoDB 6.0+ (local or cloud instance)
- Git for version control

### Environment Variables

Create the following environment files:

#### `.env.production` (Backend)

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://mongodb:27017/teacher-scheduler
# For cloud MongoDB: mongodb+srv://username:password@cluster.mongodb.net/teacher-scheduler

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://your-domain.com

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (if notifications enabled)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### `.env.production` (Frontend)

```bash
# API Configuration
VITE_API_URL=https://api.your-domain.com
VITE_APP_NAME=Teacher Scheduler
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

## Environment Setup

### 1. Clone and Setup Repository

```bash
git clone https://github.com/your-org/teacher-scheduler.git
cd teacher-scheduler
npm install
```

### 2. Build for Production

```bash
# Build all projects
npm run build

# Or build individually
npm run nx build frontend
npm run nx build backend
```

### 3. Test Production Build Locally

```bash
# Start backend
npm run start:backend:prod

# Serve frontend (in separate terminal)
npm run preview:frontend
```

## Docker Deployment

### 1. Complete Docker Setup

#### `Dockerfile.frontend`

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY nx.json tsconfig.base.json ./
RUN npm ci --only=production

COPY frontend/ ./frontend/
COPY shared-types/ ./shared-types/
RUN npm run nx build frontend

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### `Dockerfile.backend`

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json tsconfig.base.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/ ./backend/
COPY shared-types/ ./shared-types/

# Build application
RUN npm run nx build backend

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
CMD ["node", "dist/backend/main.js"]
```

#### `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - '80:80'
      - '443:443'
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/teacher-scheduler
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  mongodb:
    image: mongo:6.0
    ports:
      - '27017:27017'
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=teacher-scheduler
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
```

### 2. Deploy with Docker Compose

```bash
# Create production environment file
cp .env.example .env.production

# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale backend if needed
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Cloud Deployment

### AWS Deployment

#### 1. Using AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init teacher-scheduler

# Create environment
eb create production

# Deploy
eb deploy
```

#### 2. Using AWS ECS (Fargate)

```yaml
# ecs-task-definition.json
{ 'family': 'teacher-scheduler', 'networkMode': 'awsvpc', 'requiresCompatibilities': ['FARGATE'], 'cpu': '256', 'memory': '512', 'executionRoleArn': 'arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole', 'taskRoleArn': 'arn:aws:iam::ACCOUNT:role/ecsTaskRole', 'containerDefinitions': [{ 'name': 'backend', 'image': 'your-account.dkr.ecr.region.amazonaws.com/teacher-scheduler-backend:latest', 'portMappings': [{ 'containerPort': 3000, 'protocol': 'tcp' }], 'environment': [{ 'name': 'NODE_ENV', 'value': 'production' }], 'logConfiguration': { 'logDriver': 'awslogs', 'options': { 'awslogs-group': '/ecs/teacher-scheduler', 'awslogs-region': 'us-east-1', 'awslogs-stream-prefix': 'ecs' } } }] }
```

### Digital Ocean Deployment

#### 1. Using App Platform

```yaml
# .do/app.yaml
name: teacher-scheduler
services:
  - name: backend
    source_dir: backend
    github:
      repo: your-org/teacher-scheduler
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        value: ${DATABASE_URL}

  - name: frontend
    source_dir: frontend
    github:
      repo: your-org/teacher-scheduler
      branch: main
    build_command: npm run build
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs

databases:
  - name: teacher-scheduler-db
    engine: MONGODB
    version: '5'
```

#### 2. Using Droplets with Docker

```bash
# Create droplet
doctl compute droplet create teacher-scheduler \
  --size s-2vcpu-2gb \
  --image docker-20-04 \
  --region nyc1 \
  --ssh-keys your-ssh-key-id

# SSH into droplet
ssh root@your-droplet-ip

# Clone and deploy
git clone https://github.com/your-org/teacher-scheduler.git
cd teacher-scheduler
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables via Vercel dashboard
VITE_API_URL=https://your-backend.railway.app
```

#### Backend on Railway

```yaml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"

[env]
NODE_ENV = "production"
```

## Production Considerations

### 1. SSL/TLS Configuration

#### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Database Backup Strategy

```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DATABASE_NAME="teacher-scheduler"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
mongodump --db $DATABASE_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR $DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.tar.gz s3://your-backup-bucket/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
```

### 3. Process Management with PM2

```bash
# Install PM2
npm install -g pm2

# PM2 ecosystem file (ecosystem.config.js)
module.exports = {
  apps: [{
    name: 'teacher-scheduler-backend',
    script: 'dist/backend/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/var/log/teacher-scheduler/combined.log',
    out_file: '/var/log/teacher-scheduler/out.log',
    error_file: '/var/log/teacher-scheduler/error.log',
    max_memory_restart: '1G'
  }]
};

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

## Monitoring and Maintenance

### 1. Health Check Endpoints

```typescript
// backend/src/routes/health.ts
import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  };

  res.status(200).json(health);
});

router.get('/ready', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});

export default router;
```

### 2. Logging Configuration

```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
  defaultMeta: { service: 'teacher-scheduler' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
```

### 3. Performance Monitoring

```bash
# Install monitoring tools
npm install @sentry/node @sentry/react

# Add to backend
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

# Add to frontend
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### 4. Automated Updates

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.7
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.PRIVATE_KEY }}
          script: |
            cd /opt/teacher-scheduler
            git pull origin main
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml up -d --build
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**

   - Check MongoDB service status
   - Verify connection string and credentials
   - Check network connectivity

2. **Memory Issues**

   - Monitor application memory usage
   - Implement proper garbage collection
   - Scale horizontally if needed

3. **SSL Certificate Issues**
   - Verify certificate validity
   - Check certificate chain
   - Ensure proper nginx configuration

### Useful Commands

```bash
# Check container logs
docker-compose logs -f backend

# Monitor resource usage
docker stats

# Access container shell
docker exec -it teacher-scheduler_backend_1 sh

# Database backup
docker exec teacher-scheduler_mongodb_1 mongodump --db teacher-scheduler

# Restart services
docker-compose restart backend
```

---

This deployment guide should be updated as new deployment strategies and requirements are identified.
