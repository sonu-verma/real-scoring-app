import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { matches, commentary } from './db/schema.js';

async function main() {
  try {
    console.log('Performing CRUD operations on sports matches...\n');

    // CREATE: Insert a new match
    const [newMatch] = await db
      .insert(matches)
      .values({
        sport: 'Football',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        status: 'scheduled',
        startTime: new Date(Date.now() + 3600000),
      })
      .returning();

    if (!newMatch) {
      throw new Error('Failed to create match');
    }

    console.log('✅ CREATE: New match created:', newMatch);

    // READ: Select the match
    const foundMatch = await db
      .select()
      .from(matches)
      .where(eq(matches.id, newMatch.id));
    console.log('✅ READ: Found match:', foundMatch[0]);

    // CREATE: Insert commentary for the match
    const [newCommentary] = await db
      .insert(commentary)
      .values({
        matchId: newMatch.id,
        sequence: 1,
        minute: 0,
        period: 'First Half',
        eventType: 'match_started',
        message: 'Match has started!',
      })
      .returning();

    if (!newCommentary) {
      throw new Error('Failed to create commentary');
    }

    console.log('✅ CREATE: Commentary added:', newCommentary);

    // UPDATE: Update match status to live
    const [updatedMatch] = await db
      .update(matches)
      .set({ status: 'live' })
      .where(eq(matches.id, newMatch.id))
      .returning();

    if (!updatedMatch) {
      throw new Error('Failed to update match');
    }

    console.log('✅ UPDATE: Match updated:', updatedMatch);

    // UPDATE: Update match score
    const [matchWithScore] = await db
      .update(matches)
      .set({ homeScore: 1, awayScore: 0 })
      .where(eq(matches.id, newMatch.id))
      .returning();

    console.log('✅ UPDATE: Match score updated:', matchWithScore);

    // DELETE: Remove commentary
    await db.delete(commentary).where(eq(commentary.id, newCommentary.id));
    console.log('✅ DELETE: Commentary deleted.\n');

    // DELETE: Remove match
    await db.delete(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ DELETE: Match deleted.\n');

    console.log('✨ CRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    // Close the connection pool
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
  }
}

main();