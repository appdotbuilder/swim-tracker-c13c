import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { swimmingPracticesTable } from '../db/schema';
import { getSwimmingPractices } from '../handlers/get_swimming_practices';

describe('getSwimmingPractices', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no practices exist', async () => {
    const result = await getSwimmingPractices();
    
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all swimming practices', async () => {
    // Create test data - insert multiple practices with different dates
    await db.insert(swimmingPracticesTable)
      .values([
        {
          date: '2024-01-15',
          duration_minutes: 60,
          distance_meters: 2000.5,
          notes: 'Good practice session'
        },
        {
          date: '2024-01-10',
          duration_minutes: 45,
          distance_meters: 1500.0,
          notes: 'Recovery swim'
        },
        {
          date: '2024-01-20',
          duration_minutes: 75,
          distance_meters: 2500.75,
          notes: null // Test null notes
        }
      ])
      .execute();

    const result = await getSwimmingPractices();

    // Should return all 3 practices
    expect(result).toHaveLength(3);

    // Validate structure and types of returned data
    result.forEach(practice => {
      expect(practice.id).toBeDefined();
      expect(typeof practice.id).toBe('number');
      expect(practice.date).toBeInstanceOf(Date);
      expect(typeof practice.duration_minutes).toBe('number');
      expect(typeof practice.distance_meters).toBe('number');
      expect(practice.created_at).toBeInstanceOf(Date);
      // notes can be string or null
      expect(typeof practice.notes === 'string' || practice.notes === null).toBe(true);
    });
  });

  it('should return practices ordered by date (newest first)', async () => {
    // Insert practices in random order
    await db.insert(swimmingPracticesTable)
      .values([
        {
          date: '2024-01-10', // Middle date
          duration_minutes: 45,
          distance_meters: 1500.0,
          notes: 'Middle practice'
        },
        {
          date: '2024-01-20', // Newest date
          duration_minutes: 75,
          distance_meters: 2500.0,
          notes: 'Latest practice'
        },
        {
          date: '2024-01-05', // Oldest date
          duration_minutes: 30,
          distance_meters: 1000.0,
          notes: 'First practice'
        }
      ])
      .execute();

    const result = await getSwimmingPractices();

    expect(result).toHaveLength(3);
    
    // Verify ordering - newest first
    expect(result[0].notes).toEqual('Latest practice'); // 2024-01-20
    expect(result[1].notes).toEqual('Middle practice'); // 2024-01-10
    expect(result[2].notes).toEqual('First practice');  // 2024-01-05

    // Verify dates are in descending order
    expect(result[0].date >= result[1].date).toBe(true);
    expect(result[1].date >= result[2].date).toBe(true);
  });

  it('should handle decimal distances correctly', async () => {
    // Test with decimal distance values
    await db.insert(swimmingPracticesTable)
      .values({
        date: '2024-01-15',
        duration_minutes: 60,
        distance_meters: 2000.75, // Decimal distance
        notes: 'Test decimal distance'
      })
      .execute();

    const result = await getSwimmingPractices();

    expect(result).toHaveLength(1);
    expect(result[0].distance_meters).toEqual(2000.75);
    expect(typeof result[0].distance_meters).toBe('number');
  });

  it('should handle null notes correctly', async () => {
    // Test with null notes
    await db.insert(swimmingPracticesTable)
      .values({
        date: '2024-01-15',
        duration_minutes: 60,
        distance_meters: 2000.0,
        notes: null // Explicitly null
      })
      .execute();

    const result = await getSwimmingPractices();

    expect(result).toHaveLength(1);
    expect(result[0].notes).toBeNull();
  });

  it('should preserve all database fields', async () => {
    await db.insert(swimmingPracticesTable)
      .values({
        date: '2024-01-15',
        duration_minutes: 60,
        distance_meters: 2000.0,
        notes: 'Complete test'
      })
      .execute();

    const result = await getSwimmingPractices();

    expect(result).toHaveLength(1);
    const practice = result[0];

    // Verify all expected fields are present
    expect(practice).toHaveProperty('id');
    expect(practice).toHaveProperty('date');
    expect(practice).toHaveProperty('duration_minutes');
    expect(practice).toHaveProperty('distance_meters');
    expect(practice).toHaveProperty('notes');
    expect(practice).toHaveProperty('created_at');

    // Verify field values
    expect(practice.duration_minutes).toEqual(60);
    expect(practice.distance_meters).toEqual(2000.0);
    expect(practice.notes).toEqual('Complete test');
    expect(practice.date).toBeInstanceOf(Date);
    expect(practice.created_at).toBeInstanceOf(Date);
  });
});