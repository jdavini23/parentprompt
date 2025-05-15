const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function runMigration() {
  const connectionString = `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname}:6543/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    const sql = fs.readFileSync(path.join(__dirname, '../sql/create_child_functions.sql'), 'utf8');
    await client.query(sql);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
