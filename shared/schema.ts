import { pgTable, text, serial, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Main tank table
export const tanks = pgTable("tanks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fillLevel: real("fill_level").notNull(),
  temperature: real("temperature").notNull(),
  capacity: real("capacity").notNull().default(150000), // Maximum capacity 150,000 liters
  status: text("status").notNull().default("online"),
  lastUpdated: text("last_updated"),
  location: text("location"), // Physical location of the tank
  description: text("description"), // General description
  group: text("group").default("default"), // For categorizing tanks
  alertLowThreshold: real("alert_low_threshold").default(15), // Warn when below this percentage
  alertHighThreshold: real("alert_high_threshold").default(90), // Warn when above this percentage
  tempLowThreshold: real("temp_low_threshold").default(10), // Low temperature threshold for alerts
  tempHighThreshold: real("temp_high_threshold").default(35), // High temperature threshold for alerts
  maintenanceInterval: integer("maintenance_interval").default(90), // Days between maintenance
  lastMaintenance: text("last_maintenance"), // Date of last maintenance
  nextMaintenance: text("next_maintenance"), // Date of next scheduled maintenance
  installDate: text("install_date"), // When the tank was installed
  model: text("model"), // Tank model information
  manufacturer: text("manufacturer"), // Tank manufacturer
  serialNumber: text("serial_number"), // Serial number of the tank
  notes: text("notes"), // Additional notes
  isActive: boolean("is_active").default(true), // Whether the tank is currently active
});

// Tank history table for logging events and historical data
export const tankHistory = pgTable("tank_history", {
  id: serial("id").primaryKey(),
  tankId: integer("tank_id").notNull(), // Reference to the tank
  timestamp: text("timestamp").notNull(), // When the event occurred
  eventType: text("event_type").notNull(), // Type of event: fill, temperature, maintenance, alert, etc.
  value: real("value"), // Numeric value associated with the event (e.g., fill level)
  description: text("description"), // Description of the event
  details: jsonb("details"), // Additional JSON details about the event
});

// Tank maintenance table for scheduling and tracking maintenance
export const tankMaintenance = pgTable("tank_maintenance", {
  id: serial("id").primaryKey(),
  tankId: integer("tank_id").notNull(), // Reference to the tank
  scheduledDate: text("scheduled_date").notNull(), // When maintenance is scheduled
  completedDate: text("completed_date"), // When maintenance was completed (null if not yet completed)
  maintenanceType: text("maintenance_type").notNull(), // Type of maintenance
  description: text("description"), // Description of the maintenance task
  technician: text("technician"), // Who performed the maintenance
  notes: text("notes"), // Additional notes
  status: text("status").default("scheduled"), // Status: scheduled, in-progress, completed, cancelled
  cost: real("cost"), // Cost of maintenance
  parts: jsonb("parts"), // Parts replaced during maintenance
});

// Enhanced tank schema with all properties
export const tankSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  fillLevel: z.number().min(0).max(100),
  temperature: z.number(),
  capacity: z.number().positive(), // Capacity in liters
  status: z.enum(["online", "warning", "offline"]),
  lastUpdated: z.string().optional(),
  dbType: z.enum(["memory", "firebase", "postgres", "mysql", "mongodb"]).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  group: z.string().optional().default("default"),
  alertLowThreshold: z.number().min(0).max(100).default(15).optional(),
  alertHighThreshold: z.number().min(0).max(100).default(90).optional(),
  tempLowThreshold: z.number().default(10).optional(),
  tempHighThreshold: z.number().default(35).optional(),
  maintenanceInterval: z.number().int().positive().default(90).optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
  installDate: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
});

// Tank history schema
export const tankHistorySchema = z.object({
  id: z.number(),
  tankId: z.number(),
  timestamp: z.string(),
  eventType: z.string(),
  value: z.number().optional(),
  description: z.string().optional(),
  details: z.record(z.any()).optional(),
});

// Tank maintenance schema
export const tankMaintenanceSchema = z.object({
  id: z.number(),
  tankId: z.number(),
  scheduledDate: z.string(),
  completedDate: z.string().optional(),
  maintenanceType: z.string(),
  description: z.string().optional(),
  technician: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "in-progress", "completed", "cancelled"]).default("scheduled"),
  cost: z.number().optional(),
  parts: z.record(z.any()).optional(),
});

// Insert schemas
export const insertTankSchema = tankSchema.omit({ id: true, lastUpdated: true });
export const insertTankHistorySchema = tankHistorySchema.omit({ id: true });
export const insertTankMaintenanceSchema = tankMaintenanceSchema.omit({ id: true });

// Export types
export type Tank = z.infer<typeof tankSchema>;
export type InsertTank = z.infer<typeof insertTankSchema>;
export type TankHistory = z.infer<typeof tankHistorySchema>;
export type InsertTankHistory = z.infer<typeof insertTankHistorySchema>;
export type TankMaintenance = z.infer<typeof tankMaintenanceSchema>;
export type InsertTankMaintenance = z.infer<typeof insertTankMaintenanceSchema>;
