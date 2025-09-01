import { z } from 'zod';

// Swimming practice schema
export const swimmingPracticeSchema = z.object({
  id: z.number(),
  date: z.coerce.date(), // Automatically converts string timestamps to Date objects
  duration_minutes: z.number().int().positive(), // Duration in minutes, must be positive integer
  distance_meters: z.number().positive(), // Total distance in meters, must be positive
  notes: z.string().nullable(), // Optional notes, can be null
  created_at: z.coerce.date() // Automatically converts string timestamps to Date objects
});

export type SwimmingPractice = z.infer<typeof swimmingPracticeSchema>;

// Input schema for creating swimming practices
export const createSwimmingPracticeInputSchema = z.object({
  date: z.coerce.date(), // Practice date
  duration_minutes: z.number().int().positive(), // Duration in minutes, must be positive integer
  distance_meters: z.number().positive(), // Total distance in meters, must be positive
  notes: z.string().nullable().optional() // Optional notes, can be null or undefined
});

export type CreateSwimmingPracticeInput = z.infer<typeof createSwimmingPracticeInputSchema>;

// Input schema for updating swimming practices
export const updateSwimmingPracticeInputSchema = z.object({
  id: z.number(),
  date: z.coerce.date().optional(), // Optional practice date
  duration_minutes: z.number().int().positive().optional(), // Optional duration
  distance_meters: z.number().positive().optional(), // Optional distance
  notes: z.string().nullable().optional() // Optional notes, can be null or undefined
});

export type UpdateSwimmingPracticeInput = z.infer<typeof updateSwimmingPracticeInputSchema>;