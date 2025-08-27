# HNFZF Quick Reference

## 🚀 Quick Start

```bash
# Complete development setup
npm install
npm run db:setup
npm run dev:server  # Terminal 1
npm run dev:frontend  # Terminal 2
```

## 🗄️ Database Commands

| Command              | Description                                    |
| -------------------- | ---------------------------------------------- |
| `npm run db:setup`   | Complete database setup (create + sample data) |
| `npm run db:start`   | Start database                                 |
| `npm run db:stop`    | Stop database                                  |
| `npm run db:restart` | Restart database                               |
| `npm run db:status`  | Check database status                          |
| `npm run db:clean`   | Remove database and all data                   |
| `npm run db:logs`    | Show database logs                             |
| `npm run db:connect` | Connect to database CLI                        |

## 🔧 Database Utilities

| Command            | Description                   |
| ------------------ | ----------------------------- |
| `npm run db:test`  | Test database connection      |
| `npm run db:init`  | Initialize schema only        |
| `npm run db:seed`  | Insert sample data only       |
| `npm run db:check` | Show detailed database status |

## 🐳 Docker Commands

| Command                   | Description                    |
| ------------------------- | ------------------------------ |
| `npm run docker:dev`      | Start all development services |
| `npm run docker:dev:down` | Stop development services      |
| `npm run docker:up`       | Start production services      |
| `npm run docker:down`     | Stop production services       |
| `npm run docker:logs`     | Show all service logs          |
| `npm run docker:clean`    | Clean up Docker resources      |

## 💻 Development Commands

| Command                     | Description                             |
| --------------------------- | --------------------------------------- |
| `npm run dev:server`        | Start backend server with hot reload    |
| `npm run dev:server:simple` | Start backend server (no hot reload)    |
| `npm run dev:server:watch`  | Start backend server with file watching |
| `npm run dev:frontend`      | Start frontend dev server only          |
| `npm run dev:setup`         | Start database + backend server         |
| `npm run validate`          | Validate entire setup                   |

## 🏷️ Product Flags API

### Get product with flags

```bash
GET http://localhost:1337/api/product/5921875
```

### Get flags for a product

```bash
GET http://localhost:1337/api/product/5921875/flags
```

### Add flag to product

```bash
POST http://localhost:1337/api/product/5921875/flags
Content-Type: application/json

{
  "flagType": "special_offer",
  "flagValue": "20% Off",
  "additionalData": {"discount": "20%"},
  "description": "Limited time offer"
}
```

### Delete flag

```bash
DELETE http://localhost:1337/api/product/5921875/flags/1
```

## 🗄️ Database Connection

**Development:**

- URL: `postgresql://postgres:postgres@localhost:5433/hnfzf_dev`
- Port: `5433`

**Production:**

- URL: `postgresql://postgres:postgres@localhost:5432/hnfzf`
- Port: `5432`

## 🔍 Sample Test Data

Products with flags already set up:

- **5921875** - Has special_offer, featured, warranty_extended flags
- **TEST123** - Has clearance, stock_alert flags
- **DEMO456** - Has new_arrival, best_seller flags

## 🆘 Troubleshooting

| Problem              | Solution                                              |
| -------------------- | ----------------------------------------------------- |
| Database won't start | `npm run db:clean && npm run db:setup`                |
| Connection refused   | `npm run db:status` then `npm run db:logs`            |
| Missing flags        | `npm run db:seed`                                     |
| API not responding   | Check if running: `npm run validate`                  |
| Port conflicts       | Check ports 5433 (dev DB), 5432 (prod DB), 1337 (API) |

## 📁 Key Files

- `scripts/setup-db.sh` - Database setup shell script
- `scripts/db-utils.js` - Database utilities (Node.js)
- `scripts/validate-setup.js` - Setup validation
- `init.sql` - Database schema
- `DEV_SETUP.md` - Detailed setup guide
- `PRODUCT_FLAGS.md` - Flag system documentation
