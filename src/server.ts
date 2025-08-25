import express, { Request, Response } from "express";
import cors from "cors";
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
server.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:4173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

server.use(express.json());

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
