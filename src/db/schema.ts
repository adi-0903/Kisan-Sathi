import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const neonTestTable = pgTable("neon_test", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
