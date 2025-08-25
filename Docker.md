# 🐳 Docker Setup for HNFZF

This guide will help you run the entire HNFZF application stack using Docker.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- 4GB+ RAM available for Docker

## 🚀 Quick Start (Production)

### 1. Build and Start All Services

```bash
# Build all Docker images
npm run docker:build

# Start all services in background
npm run docker:up

# View logs
npm run docker:logs
```

### 2. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:1337
- **Database**: localhost:5432

### 3. Run Product Ingestion

```bash
# Run ingestion for a specific product
npm run docker:ingest -- "moto tag"

# Or run directly with docker-compose
docker-compose run --rm ingest node dist/ingest.js "WH1000XM4B"
```

### 4. Stop Services

```bash
npm run docker:down
```

## 🛠️ Development Setup

For development with hot-reload:

```bash
# Start development environment
npm run docker:dev

# Stop development environment
npm run docker:dev:down
```

This runs:

- Database on port 5433
- Backend with hot-reload on port 1338

## 📦 Services Overview

### 🗄️ Database (PostgreSQL)

- **Image**: postgres:15-alpine
- **Port**: 5432
- **Credentials**: postgres/postgres
- **Database**: hnfzf

### 🔧 Backend API

- **Build**: Custom Node.js image
- **Port**: 1337
- **Health Check**: http://localhost:1337/health
- **Features**: Product search API, CORS enabled

### 🌐 Frontend

- **Build**: Multi-stage (Node.js → Nginx)
- **Port**: 80
- **Features**: React app with API proxy

### 📥 Ingestion Service

- **Profile**: ingest (on-demand)
- **Purpose**: Scrape and store product data
- **Usage**: Run manually or via cron

## 🔧 Docker Commands

### Basic Operations

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Restart a service
docker-compose restart [service-name]
```

### Data Management

```bash
# Clean everything (removes data!)
npm run docker:clean

# Backup database
docker exec hnfzf-db pg_dump -U postgres hnfzf > backup.sql

# Restore database
docker exec -i hnfzf-db psql -U postgres hnfzf < backup.sql
```

### Debugging

```bash
# Access backend container
docker exec -it hnfzf-backend sh

# Access database
docker exec -it hnfzf-db psql -U postgres hnfzf

# View frontend files
docker exec -it hnfzf-frontend sh
```

## 🔍 Troubleshooting

### Backend Won't Start

```bash
# Check backend logs
docker-compose logs backend

# Verify database connection
docker-compose exec backend node -e "console.log(process.env.DATABASE_URL)"
```

### Frontend Can't Reach API

```bash
# Check nginx configuration
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Test API connection
docker-compose exec frontend curl http://backend:1337/health
```

### Database Issues

```bash
# Check database status
docker-compose exec database pg_isready -U postgres

# View database logs
docker-compose logs database
```

### Ingestion Problems

```bash
# Run ingestion with debug output
docker-compose run --rm ingest node dist/ingest.js "test" 1

# Check ingestion logs
docker-compose logs ingest
```

## 📁 File Structure

```
hnfzf/
├── Dockerfile.backend          # Backend API image
├── Dockerfile.frontend         # Frontend React app image
├── docker-compose.yml          # Production services
├── docker-compose.dev.yml      # Development services
├── nginx.conf                  # Frontend proxy config
├── init.sql                    # Database initialization
├── .dockerignore              # Docker build exclusions
└── Docker-README.md           # This file
```

## 🌍 Environment Variables

Create a `.env` file for custom configuration:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@database:5432/hnfzf

# Backend
PORT=1337
NODE_ENV=production

# Frontend (build-time)
VITE_API_URL=http://localhost:1337
```

## 🚀 Production Deployment

For production deployment:

1. **Use proper secrets**:

   ```env
   POSTGRES_PASSWORD=your-secure-password
   DATABASE_URL=postgresql://user:password@db:5432/hnfzf
   ```

2. **Configure reverse proxy** (Nginx/Traefik)
3. **Set up SSL certificates**
4. **Configure log aggregation**
5. **Set up monitoring**

## 📝 Notes

- The frontend automatically proxies `/api/*` requests to the backend
- Database data persists in Docker volumes
- Ingestion service runs on-demand via profiles
- Health checks ensure service availability
- All services use a custom Docker network for internal communication

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `npm run docker:logs`
2. Verify all services are healthy: `docker-compose ps`
3. Test connectivity: `docker-compose exec frontend curl http://backend:1337/health`
4. Clean and restart: `npm run docker:clean && npm run docker:up`
