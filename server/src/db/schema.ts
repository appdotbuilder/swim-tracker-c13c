import { serial, text, pgTable, timestamp, integer, real, date } from 'drizzle-orm/pg-core';

export const swimmingPracticesTable = pgTable('swimming_practices', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(), // Practice date (date only, no time)
  duration_minutes: integer('duration_minutes').notNull(), // Duration in minutes
  distance_meters: real('distance_meters').notNull(), // Distance in meters (allows decimals)
  notes: text('notes'), // Nullable by default, matches Zod schema
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type SwimmingPractice = typeof swimmingPracticesTable.$inferSelect; // For SELECT operations
export type NewSwimmingPractice = typeof swimmingPracticesTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { swimmingPractices: swimmingPracticesTable };