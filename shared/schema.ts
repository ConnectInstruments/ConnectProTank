import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tanks = pgTable("tanks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fillLevel: real("fill_level").notNull(),
  temperature: real("temperature").notNull(),
  capacity: real("capacity").notNull().default(1000), // Default capacity in liters
  status: text("status").notNull().default("online"),
  lastUpdated: text("last_updated"),
});

export const tankSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  fillLevel: z.number().min(0).max(100),
  temperature: z.number(),
  capacity: z.number().positive(), // Capacity in liters
  status: z.enum(["online", "warning", "offline"]),
  lastUpdated: z.string().optional(),
  dbType: z.enum(["memory", "postgres", "mysql", "mongodb"]).optional(),
});

export const insertTankSchema = tankSchema.omit({ id: true, lastUpdated: true });

export type Tank = z.infer<typeof tankSchema>;
export type InsertTank = z.infer<typeof insertTankSchema>;
