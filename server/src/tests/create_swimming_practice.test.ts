import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { swimmingPracticesTable } from '../db/schema';
import { type CreateSwimmingPracticeInput } from '../schema';
import { createSwimmingPractice } from '../handlers/create_swimming_practice';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateSwimmingPracticeInput = {
  date: new Date('2024-01-15'),
  duration_minutes: 60,
  distance_meters: 2000.5,
  notes: 'Great practice session with focus on freestyle technique'
};

// Test input without optional notes
const testInputWithoutNotes: CreateSwimmingPracticeInput = {
  date: new Date('2024-01-16'),
  duration_minutes: 45,
  distance_meters: 1500
};

describe('createSwimmingPractice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a swimming practice with all fields', async () => {
    const result = await createSwimmingPractice(testInput);

    // Basic field validation
    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.toISOString().split('T')[0]).toEqual('2024-01-15');
    expect(result.duration_minutes).toEqual(60);
    expect(result.distance_meters).toEqual(2000.5);
    expect(result.notes).toEqual('Great practice session with focus on freestyle technique');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a swimming practice without notes', async () => {
    const result = await createSwimmingPractice(testInputWithoutNotes);

    // Validate fields including null notes
    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.toISOString().split('T')[0]).toEqual('2024-01-16');
    expect(result.duration_minutes).toEqual(45);
    expect(result.distance_meters).toEqual(1500);
    expect(result.notes).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save swimming practice to database', async () => {
    const result = await createSwimmingPractice(testInput);

    // Query using proper drizzle syntax
    const practices = await db.select()
      .from(swimmingPracticesTable)
      .where(eq(swimmingPracticesTable.id, result.id))
      .execute();

    expect(practices).toHaveLength(1);
    const practice = practices[0];
    expect(practice.date).toEqual('2024-01-15'); // Date stored as string in database
    expect(practice.duration_minutes).toEqual(60);
    expect(practice.distance_meters).toEqual(2000.5);
    expect(practice.notes).toEqual('Great practice session with focus on freestyle technique');
    expect(practice.created_at).toBeInstanceOf(Date);
  });

  it('should handle decimal distances correctly', async () => {
    const inputWithDecimal: CreateSwimmingPracticeInput = {
      date: new Date('2024-01-17'),
      duration_minutes: 30,
      distance_meters: 1234.75,
      notes: 'Short distance practice'
    };

    const result = await createSwimmingPractice(inputWithDecimal);

    expect(result.distance_meters).toEqual(1234.75);
    expect(typeof result.distance_meters).toBe('number');

    // Verify in database
    const practices = await db.select()
      .from(swimmingPracticesTable)
      .where(eq(swimmingPracticesTable.id, result.id))
      .execute();

    expect(practices[0].distance_meters).toEqual(1234.75);
  });

  it('should handle explicit null notes', async () => {
    const inputWithNullNotes: CreateSwimmingPracticeInput = {
      date: new Date('2024-01-18'),
      duration_minutes: 90,
      distance_meters: 3000,
      notes: null
    };

    const result = await createSwimmingPractice(inputWithNullNotes);

    expect(result.notes).toBeNull();

    // Verify in database
    const practices = await db.select()
      .from(swimmingPracticesTable)
      .where(eq(swimmingPracticesTable.id, result.id))
      .execute();

    expect(practices[0].notes).toBeNull();
  });

  it('should create multiple practices with different dates', async () => {
    const practice1 = await createSwimmingPractice({
      date: new Date('2024-01-10'),
      duration_minutes: 45,
      distance_meters: 1800
    });

    const practice2 = await createSwimmingPractice({
      date: new Date('2024-01-11'),
      duration_minutes: 60,
      distance_meters: 2200
    });

    expect(practice1.id).not.toEqual(practice2.id);
    expect(practice1.date.toISOString().split('T')[0]).toEqual('2024-01-10');
    expect(practice2.date.toISOString().split('T')[0]).toEqual('2024-01-11');

    // Verify both are in database
    const allPractices = await db.select()
      .from(swimmingPracticesTable)
      .execute();

    expect(allPractices).toHaveLength(2);
  });
});