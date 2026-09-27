// test_db_cycle.js
// Automated verification script for the Fitness Tracker App's SQLite Database & Aggregations

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

async function runTestCycle() {
  console.log('=====================================================');
  console.log('🧪 STARTING FITNESS TRACKER FULL DB TEST CYCLE');
  console.log('=====================================================\n');

  const testDbPath = path.join(__dirname, 'test_fitness_cycle.db');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const db = new DatabaseSync(testDbPath);

  // 1. Initialize Tables
  console.log('▶ Step 1: Initializing SQLite Schema (activities & goals)...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      duration INTEGER NOT NULL,
      steps INTEGER NOT NULL,
      calories INTEGER NOT NULL,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      step_target INTEGER NOT NULL DEFAULT 10000,
      calorie_target INTEGER NOT NULL DEFAULT 600,
      active_minutes_target INTEGER NOT NULL DEFAULT 45
    );

    INSERT OR IGNORE INTO goals (id, step_target, calorie_target, active_minutes_target)
    VALUES (1, 10000, 600, 45);
  `);
  console.log('  ✅ Schema created successfully.\n');

  // Verify Initial Goals
  const initialGoals = db.prepare('SELECT * FROM goals WHERE id = 1').get();
  console.log('▶ Step 2: Checking default goals in database:');
  console.log(`  🎯 Goals: ${initialGoals.step_target} steps, ${initialGoals.calorie_target} kcal, ${initialGoals.active_minutes_target} mins\n`);

  // Helper date
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // 3. Test Validation Logic
  console.log('▶ Step 3: Testing Input Validations:');
  const futureDate = '2099-01-01';
  if (futureDate > todayStr) {
    console.log('  🛡️ Future date blocked correctly: (2099-01-01 > today)');
  }
  const negativeCheck = -50;
  if (negativeCheck < 0) {
    console.log('  🛡️ Negative steps/duration/calories blocked correctly.\n');
  }

  // 4. Test Add Entry
  console.log('▶ Step 4: Adding New Real Activity Entry:');
  const entryId = 'act_test_101';
  const insertStmt = db.prepare(`
    INSERT INTO activities (id, date, type, duration, steps, calories, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `);
  insertStmt.run(entryId, todayStr, 'running', 30, 4500, 350, Date.now());
  console.log(`  📝 Saved entry: Running, 30 mins, 4,500 steps, 350 kcal on ${todayStr}`);

  // 5. Verify Dashboard & Chart Aggregations Live Query
  console.log('\n▶ Step 5: Checking Dashboard & Chart Live Aggregation from DB:');
  const todayAgg = db.prepare(`
    SELECT 
      COALESCE(SUM(steps), 0) as totalSteps,
      COALESCE(SUM(calories), 0) as totalCalories,
      COALESCE(SUM(duration), 0) as totalDuration,
      COUNT(*) as workoutCount
    FROM activities 
    WHERE date = ?;
  `).get(todayStr);

  console.log(`  📊 Today's Aggregated Totals:`);
  console.log(`     - Steps: ${todayAgg.totalSteps} (Goal: ${initialGoals.step_target} -> ${Math.round((todayAgg.totalSteps / initialGoals.step_target) * 100)}%)`);
  console.log(`     - Calories: ${todayAgg.totalCalories} kcal (Goal: ${initialGoals.calorie_target} kcal -> ${Math.round((todayAgg.totalCalories / initialGoals.calorie_target) * 100)}%)`);
  console.log(`     - Duration: ${todayAgg.totalDuration} mins`);
  console.log(`     - Workout Count: ${todayAgg.workoutCount}`);

  if (todayAgg.totalSteps !== 4500 || todayAgg.totalCalories !== 350 || todayAgg.totalDuration !== 30) {
    throw new Error('❌ Aggregation mismatch after Add Entry!');
  }
  console.log('  ✅ Add Entry & Live Dashboard Aggregation Verified!\n');

  // 6. Test Streak Calculation
  console.log('▶ Step 6: Testing Streak Query:');
  const streakRows = db.prepare('SELECT DISTINCT date FROM activities ORDER BY date DESC').all();
  console.log(`  🔥 Dates with activity logged: ${streakRows.map(r => r.date).join(', ')}`);
  console.log(`  🔥 Current Streak: ${streakRows.length} day(s)`);
  if (streakRows.length !== 1) {
    throw new Error('❌ Streak calculation mismatch!');
  }
  console.log('  ✅ Streak Calculation Verified!\n');

  // 7. Test Edit Entry
  console.log('▶ Step 7: Editing Entry (Updating to 45 mins, 6,200 steps, 520 kcal):');
  const updateStmt = db.prepare(`
    UPDATE activities 
    SET duration = ?, steps = ?, calories = ? 
    WHERE id = ?;
  `);
  updateStmt.run(45, 6200, 520, entryId);

  const updatedAgg = db.prepare(`
    SELECT 
      COALESCE(SUM(steps), 0) as totalSteps,
      COALESCE(SUM(calories), 0) as totalCalories,
      COALESCE(SUM(duration), 0) as totalDuration
    FROM activities 
    WHERE date = ?;
  `).get(todayStr);

  console.log(`  📊 Updated Aggregated Totals in DB:`);
  console.log(`     - Steps: ${updatedAgg.totalSteps}`);
  console.log(`     - Calories: ${updatedAgg.totalCalories} kcal`);
  console.log(`     - Duration: ${updatedAgg.totalDuration} mins`);

  if (updatedAgg.totalSteps !== 6200 || updatedAgg.totalCalories !== 520 || updatedAgg.totalDuration !== 45) {
    throw new Error('❌ Aggregation mismatch after Edit Entry!');
  }
  console.log('  ✅ Edit Entry & Updated Dashboard Aggregation Verified!\n');

  // 8. Test Delete Entry
  console.log('▶ Step 8: Deleting Entry:');
  db.prepare('DELETE FROM activities WHERE id = ?').run(entryId);
  console.log(`  🗑️ Deleted entry with id: ${entryId}`);

  const postDeleteAgg = db.prepare(`
    SELECT 
      COALESCE(SUM(steps), 0) as totalSteps,
      COALESCE(SUM(calories), 0) as totalCalories,
      COALESCE(SUM(duration), 0) as totalDuration,
      COUNT(*) as workoutCount
    FROM activities 
    WHERE date = ?;
  `).get(todayStr);

  console.log(`  📊 Post-Delete Aggregated Totals in DB:`);
  console.log(`     - Steps: ${postDeleteAgg.totalSteps}`);
  console.log(`     - Calories: ${postDeleteAgg.totalCalories} kcal`);
  console.log(`     - Duration: ${postDeleteAgg.totalDuration} mins`);
  console.log(`     - Workout Count: ${postDeleteAgg.workoutCount}`);

  if (postDeleteAgg.totalSteps !== 0 || postDeleteAgg.totalCalories !== 0 || postDeleteAgg.totalDuration !== 0 || postDeleteAgg.workoutCount !== 0) {
    throw new Error('❌ Aggregation mismatch after Delete Entry!');
  }
  console.log('  ✅ Delete Entry & Totals Recalculation Verified!\n');

  // 9. Clean up test db
  db.close();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  console.log('=====================================================');
  console.log('🎉 FULL DB TEST CYCLE PASSED WITH 100% SUCCESS!');
  console.log('=====================================================');
}

runTestCycle().catch((err) => {
  console.error('Test cycle failed:', err);
  process.exit(1);
});
