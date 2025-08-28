import express, { Request, Response } from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import { ingestProduct } from "./ingest";
import { productFlags, flagTypes } from "./models/Product";

// Load environment variables from .env.local first, then .env
dotenv.config({ path: ".env.local" });
dotenv.config();

// Debug environment variables
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

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
  try {
    const { code } = req.params;
    const products = await ingestProduct(code);

    // Enhance products with flag data
    const enhancedProducts = await Promise.all(
      products.map(async (product) => {
        try {
          // Query for flags associated with this product's SKU
          const flags = await db
            .select()
            .from(productFlags)
            .where(eq(productFlags.sku, product.productID));

          // Add flag data to the product if any flags exist
          if (flags.length > 0) {
            return {
              ...product,
              flags: flags,
              hasFlags: true,
            };
          }

          return {
            ...product,
            hasFlags: false,
          };
        } catch (flagError) {
          console.warn(
            `Error fetching flags for product ${product.productID}:`,
            flagError
          );
          return {
            ...product,
            hasFlags: false,
          };
        }
      })
    );

    res.json(enhancedProducts);
    console.log("Enhanced products:", enhancedProducts);
  } catch (error) {
    console.error("Error in product API:", error);
    res.status(500).json({ error: "Failed to fetch product data" });
  }
});

// Flag Types API endpoints
server.get("/api/flag-types", async (req: Request, res: Response) => {
  try {
    const types = await db.select().from(flagTypes);

    res.json(types);
  } catch (error) {
    console.error("Error fetching flag types:", error);
    res.status(500).json({ error: "Failed to fetch flag types" });
  }
});

// Flags API endpoints
server.get("/api/flags", async (req: Request, res: Response) => {
  try {
    const flags = await db.select().from(productFlags);

    // Transform database field names to match frontend interface
    const transformedFlags = flags.map((flag) => ({
      id: flag.id,
      sku: flag.sku,
      flagType: flag.flagType,
      flagValue: flag.flagValue,
      additionalData: flag.additionalData,
      expiryDate: flag.expiryDate?.toISOString().split("T")[0], // Format as YYYY-MM-DD
      createdAt: flag.createdAt?.toISOString(),
      updatedAt: flag.updatedAt?.toISOString(),
    }));

    res.json(transformedFlags);
  } catch (error) {
    console.error("Error fetching flags:", error);
    res.status(500).json({ error: "Failed to fetch flags" });
  }
});

server.post("/api/flags", async (req: Request, res: Response) => {
  try {
    const { sku, flagType, flagValue, additionalData, expiryDate } = req.body;

    const result = await db
      .insert(productFlags)
      .values({
        sku,
        flagType,
        flagValue,
        additionalData,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      })
      .returning();

    res.json({ success: true, flag: result[0] });
  } catch (error) {
    console.error("Error creating flag:", error);
    res.status(500).json({ error: "Failed to create flag" });
  }
});

server.put("/api/flags/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sku, flagType, flagValue, additionalData, expiryDate } = req.body;

    const result = await db
      .update(productFlags)
      .set({
        sku,
        flagType,
        flagValue,
        additionalData,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        updatedAt: new Date(),
      })
      .where(eq(productFlags.id, parseInt(id)))
      .returning();

    res.json({ success: true, flag: result[0] });
  } catch (error) {
    console.error("Error updating flag:", error);
    res.status(500).json({ error: "Failed to update flag" });
  }
});

server.delete("/api/flags/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.delete(productFlags).where(eq(productFlags.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting flag:", error);
    res.status(500).json({ error: "Failed to delete flag" });
  }
});

// Product flags management endpoints
server.post("/api/product/:sku/flags", async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const { flagType, flagValue, additionalData, expiryDate } = req.body;

    const result = await db
      .insert(productFlags)
      .values({
        sku,
        flagType,
        flagValue,
        additionalData,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      })
      .returning();

    res.json({ success: true, flag: result[0] });
  } catch (error) {
    console.error("Error creating product flag:", error);
    res.status(500).json({ error: "Failed to create product flag" });
  }
});

server.get("/api/product/:sku/flags", async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;

    const flags = await db
      .select()
      .from(productFlags)
      .where(eq(productFlags.sku, sku));

    res.json(flags);
  } catch (error) {
    console.error("Error fetching product flags:", error);
    res.status(500).json({ error: "Failed to fetch product flags" });
  }
});

server.delete(
  "/api/product/:sku/flags/:flagId",
  async (req: Request, res: Response) => {
    try {
      const { sku, flagId } = req.params;

      await db
        .delete(productFlags)
        .where(eq(productFlags.id, parseInt(flagId)));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product flag:", error);
      res.status(500).json({ error: "Failed to delete product flag" });
    }
  }
);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} :3`);
});
