import { db } from '../db';
import { swimmingPracticesTable } from '../db/schema';
import { type CreateSwimmingPracticeInput, type SwimmingPractice } from '../schema';

export const createSwimmingPractice = async (input: CreateSwimmingPracticeInput): Promise<SwimmingPractice> => {
  try {
    // Insert swimming practice record
    const result = await db.insert(swimmingPracticesTable)
      .values({
        date: input.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD format for date column
        duration_minutes: input.duration_minutes,
        distance_meters: input.distance_meters,
        notes: input.notes || null // Handle optional notes field
      })
      .returning()
      .execute();

    // Return the created swimming practice
    const practice = result[0];
    return {
      ...practice,
      date: new Date(practice.date + 'T00:00:00.000Z'), // Convert date string back to Date object
      created_at: practice.created_at // Already a Date object from timestamp column
    };
  } catch (error) {
    console.error('Swimming practice creation failed:', error);
    throw error;
  }
};