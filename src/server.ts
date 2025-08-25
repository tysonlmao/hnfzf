import express, { Request, Response } from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import { ingestProduct } from "./ingest";

dotenv.config();

export const server = express();
const PORT = process.env.PORT || 1337;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Configure CORS to allow requests from the frontend
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

server.use(express.json());

// Health check endpoint
server.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "hnfzf-backend",
  });
});

// API routes
server.get("/api/product/:code", async (req: Request, res: Response) => {
  const { code } = req.params;
  const products = await ingestProduct(code);
  res.json(products);
  console.log(products);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} :3`);
});
