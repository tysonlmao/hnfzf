import {
  pgTable,
  serial,
  text,
  numeric,
  json,
  timestamp,
  unique,
  boolean,
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

export const productFlags = pgTable(
  "product_flags",
  {
    id: serial("id").primaryKey(),
    sku: text("sku").notNull(),
    flagType: text("flag_type").notNull(),
    flagValue: text("flag_value"),
    additionalData: json("additional_data").$type<Record<string, unknown>>(),
    expiryDate: timestamp("expiry_date"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    skuFlagTypeUnique: unique().on(table.sku, table.flagType),
  })
);

export const flagTypes = pgTable("flag_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
