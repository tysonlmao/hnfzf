import { pgTable, serial, text, numeric } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  productID: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  price: numeric("price").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  lastUpdated: text("last_updated").notNull(),
});
