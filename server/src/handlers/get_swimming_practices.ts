import { db } from '../db';
import { swimmingPracticesTable } from '../db/schema';
import { type SwimmingPractice } from '../schema';
import { desc } from 'drizzle-orm';

export const getSwimmingPractices = async (): Promise<SwimmingPractice[]> => {
  try {
    // Query all swimming practices ordered by date (newest first)
    const results = await db.select()
      .from(swimmingPracticesTable)
      .orderBy(desc(swimmingPracticesTable.date))
      .execute();

    // Convert database types to match schema expectations
    return results.map(practice => ({
      ...practice,
      date: new Date(practice.date), // Convert date string to Date object
      distance_meters: Number(practice.distance_meters) // Ensure it's a number type
    }));
  } catch (error) {
    console.error('Failed to fetch swimming practices:', error);
    throw error;
  }
};