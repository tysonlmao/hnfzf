# HNFZF Development Setup Guide

This guide will help you set up the HNFZF project for local development, including the PostgreSQL database with the product flags system.

## Prerequisites

- **Docker & Docker Compose** - For running PostgreSQL
- **Node.js** (v16 or higher) - For running the application
- **npm** - For package management

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd hnfzf
npm install
```

### 2. Database Setup

#### Option A: Quick Setup (Recommended)

```bash
# This will start the database, create tables, and insert sample data
npm run db:setup
```

#### Option B: Manual Setup

```bash
# Start just the database container
npm run docker:dev

# Initialize database schema
npm run db:init

# Insert sample data
npm run db:seed
```

### 3. Start Development Servers

```bash
# Start backend server (with database auto-setup)
npm run dev:setup

# In another terminal, start frontend
npm run dev:frontend
```

## Database Commands

### Basic Operations

```bash
npm run db:setup    # Complete database setup
npm run db:start    # Start database (same as setup)
npm run db:stop     # Stop database
npm run db:restart  # Restart database
npm run db:status   # Check database status
npm run db:clean    # Remove database and all data
```

### Database Utilities

```bash
npm run db:test     # Test database connection
npm run db:init     # Initialize schema only
npm run db:seed     # Insert sample data only
npm run db:check    # Show database status and data
npm run db:logs     # Show database logs
npm run db:connect  # Connect to database CLI
```

### Advanced Database Operations

#### Using the Node.js utility script:

```bash
# Test connection
node scripts/db-utils.js test

# Add a custom flag
node scripts/db-utils.js add-flag 5921875 "custom_flag" "Custom Value" "Custom description"

# Remove all flags from a product
node scripts/db-utils.js remove-flags 5921875

# Check database status
node scripts/db-utils.js status

# Use production database (if available)
node scripts/db-utils.js status --prod
```

#### Using the shell script directly:

```bash
# Various operations
./scripts/setup-db.sh setup
./scripts/setup-db.sh clean
./scripts/setup-db.sh restart
./scripts/setup-db.sh logs
./scripts/setup-db.sh connect
./scripts/setup-db.sh status
```

## Environment Configuration

### Development Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/hnfzf_dev

# Server Configuration
PORT=1337
NODE_ENV=development

# Development Database Details
DB_HOST=localhost
DB_PORT=5433
DB_NAME=hnfzf_dev
DB_USER=postgres
DB_PASSWORD=postgres
```

### Database Connection Details

**Development Database:**

- Host: `localhost`
- Port: `5433`
- Database: `hnfzf_dev`
- Username: `postgres`
- Password: `postgres`
- Connection URL: `postgresql://postgres:postgres@localhost:5433/hnfzf_dev`

**Production Database:**

- Host: `localhost`
- Port: `5432`
- Database: `hnfzf`
- Username: `postgres`
- Password: `postgres`
- Connection URL: `postgresql://postgres:postgres@localhost:5432/hnfzf`

## Sample Data

The setup script includes sample product flags for testing:

### Sample Products with Flags:

**SKU: 5921875**

- `special_offer`: Limited Time (20% discount, expires 2024-12-31)
- `featured`: homepage (banner position, high priority)
- `warranty_extended`: 3_years (original 1 year, extended to 3 years)

**SKU: TEST123**

- `clearance`: final_sale (original $299, sale $199)
- `stock_alert`: low_stock (5 items remaining, threshold 10)

**SKU: DEMO456**

- `new_arrival`: this_month (arrived 2024-01-15, electronics category)
- `best_seller`: top_10 (rank 3, 150 sales last month)

## Development Workflow

### Typical Development Session:

1. **Start the database:**

   ```bash
   npm run db:setup
   ```

2. **Start backend server:**

   ```bash
   npm run dev:server
   ```

3. **Start frontend (in another terminal):**

   ```bash
   npm run dev:frontend
   ```

4. **Test the flag system:**
   - Search for `5921875` in the frontend
   - You should see flags displayed in the product cards and details

### Adding New Flags

#### Via API:

```bash
curl -X POST http://localhost:1337/api/product/5921875/flags \
  -H "Content-Type: application/json" \
  -d '{
    "flagType": "sale",
    "flagValue": "50% Off",
    "additionalData": {"original_price": 299, "sale_price": 149},
    "description": "Flash sale pricing"
  }'
```

#### Via Script:

```bash
node scripts/db-utils.js add-flag 5921875 "sale" "50% Off" "Flash sale pricing"
```

### Database Management

#### Reset Database:

```bash
npm run db:clean  # Remove all data
npm run db:setup  # Fresh setup with sample data
```

#### Check Database Status:

```bash
npm run db:check  # Show tables and flag statistics
```

#### View Database Logs:

```bash
npm run db:logs  # Monitor database activity
```

## Troubleshooting

### Common Issues:

1. **Database won't start:**

   ```bash
   # Check if Docker is running
   docker --version

   # Check for port conflicts
   lsof -i :5433

   # Clean up and restart
   npm run db:clean
   npm run db:setup
   ```

2. **Connection refused:**

   ```bash
   # Wait for database to be ready
   npm run db:status

   # Check database logs
   npm run db:logs
   ```

3. **Schema errors:**

   ```bash
   # Reinitialize schema
   npm run db:clean
   npm run db:init
   npm run db:seed
   ```

4. **ts-node respawn error:**

   ```bash
   # If you get "Unknown or unexpected option: --respawn"
   # Use one of these alternatives:
   npm run dev:server:simple  # No hot reload
   npm run dev:server:watch   # With file watching

   # Or ensure ts-node-dev is installed:
   npm install --save-dev ts-node-dev
   ```

5. **Port already in use:**
   - Development database uses port `5433`
   - Production database uses port `5432`
   - Backend server uses port `1337`
   - Frontend dev server uses port specified by Vite

### Database CLI Access:

```bash
# Connect to database
npm run db:connect

# Or manually:
docker exec -it hnfzf-db-dev psql -U postgres -d hnfzf_dev
```

### Useful SQL Queries:

```sql
-- Check all flags
SELECT * FROM product_flags;

-- Check flags for specific product
SELECT * FROM product_flags WHERE sku = '5921875';

-- Check flag types and counts
SELECT flag_type, COUNT(*) FROM product_flags GROUP BY flag_type;

-- Add a flag manually
INSERT INTO product_flags (sku, flag_type, flag_value, description)
VALUES ('5921875', 'test_flag', 'test_value', 'Test description');
```

## Production Deployment

For production deployment, use the production Docker Compose configuration:

```bash
# Production setup
npm run docker:up

# Production database operations
node scripts/db-utils.js setup --prod
```

## File Structure

```
hnfzf/
├── scripts/
│   ├── setup-db.sh      # Shell script for database operations
│   └── db-utils.js      # Node.js utility for database management
├── src/
│   ├── server.ts        # Backend server with flag APIs
│   ├── models/Product.ts # Database models including product_flags
│   └── app/             # Frontend application
├── init.sql             # Database schema initialization
├── docker-compose.yml   # Production Docker configuration
├── docker-compose.dev.yml # Development Docker configuration
└── package.json         # NPM scripts for database operations
```

This setup provides a complete development environment with easy database management and the new product flags system ready for testing and development.
