import {
  pgTable,
  serial,
  text,
  numeric,
  json,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  productID: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  images: json("images").$type<string[]>(),
  productUrl: text("product_url"),
  price: text("price"),
  brand: text("brand"),
  category: text("category"),
  lastUpdated: text("last_updated").notNull(),
});

export const productFlags = pgTable("product_flags", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  flagType: text("flag_type").notNull(),
  flagValue: text("flag_value"),
  additionalData: json("additional_data").$type<Record<string, unknown>>(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
