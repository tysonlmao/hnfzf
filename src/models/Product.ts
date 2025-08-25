import { pgTable, serial, text, numeric, json } from "drizzle-orm/pg-core";

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
