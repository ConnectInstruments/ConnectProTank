import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Tank schema
export const tanks = pgTable("tanks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  maxCapacity: integer("max_capacity").notNull(),
  currentLevel: integer("current_level").notNull().default(0),
  currentPercentage: integer("current_percentage").notNull().default(0),
  temperature: doublePrecision("temperature").notNull().default(20.0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  connectionString: text("connection_string"),
  refreshRate: integer("refresh_rate").notNull().default(30),
  alertThreshold: integer("alert_threshold").notNull().default(15),
  isConnected: boolean("is_connected").notNull().default(true)
});

export const insertTankSchema = createInsertSchema(tanks).omit({
  id: true,
  lastUpdated: true
});

export const updateTankSchema = createInsertSchema(tanks).omit({
  id: true
}).partial();

export type InsertTank = z.infer<typeof insertTankSchema>;
export type UpdateTank = z.infer<typeof updateTankSchema>;
export type Tank = typeof tanks.$inferSelect;
