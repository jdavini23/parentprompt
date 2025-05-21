const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Read the SQL file
    const sql = fs.readFileSync(path.join(__dirname, '../sql/create_child_functions.sql'), 'utf8');
    
    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      const { error } = await supabase.rpc('pg_temp.execute_sql', { sql: statement });
      
      if (error) {
        // If the function doesn't exist, create it
        if (error.message.includes('function pg_temp.execute_sql(unknown) does not exist')) {
          console.log('Creating temporary execute_sql function...');
          await supabase.rpc('create_temp_execute_sql');
          // Retry the original statement
          const { error: retryError } = await supabase.rpc('pg_temp.execute_sql', { sql: statement });
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
