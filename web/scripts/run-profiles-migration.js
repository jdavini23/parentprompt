const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.DATABASE_URL;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in environment variables');
    process.exit(1);
  }

  try {
    // Read the SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, '../migrations/20240515203200_create_profiles_table.sql'), 
      'utf8'
    );
    
    // If we have DATABASE_URL, use psql directly
    if (dbUrl) {
      console.log('Using psql to run migrations...');
      execSync(`psql "${dbUrl}" -c "${sql.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()}"`, {
        stdio: 'inherit'
      });
    } 
    // Otherwise use the Supabase client
    else {
      console.log('Using Supabase client to run migrations...');
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Split the SQL file into individual statements and execute them
      const statements = sql
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);

      for (const statement of statements) {
        if (!statement) continue;
        console.log('Executing:', statement.substring(0, 100).replace(/\s+/g, ' ').trim() + (statement.length > 100 ? '...' : ''));
        
        try {
          // Use the SQL endpoint for raw SQL execution
          const { data, error } = await supabase.rpc('execute_sql', { query: statement });
          
          if (error) {
            // If the function doesn't exist, create it
            if (error.message.includes('function execute_sql(unknown) does not exist')) {
              console.log('Creating execute_sql function...');
              await createExecuteSqlFunction(supabase);
              // Retry the original statement
              const { error: retryError } = await supabase.rpc('execute_sql', { query: statement });
              if (retryError) throw retryError;
            } else {
              throw error;
            }
          }
        } catch (err) {
          console.error('Error executing statement:', err);
          throw err;
        }
      }
    }
    
    console.log('✅ Profiles migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function createExecuteSqlFunction(supabase) {
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION public.execute_sql(query text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
      RETURN json_build_object('success', true);
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'sqlstate', SQLSTATE
      );
    END;
    $$;
  `;

  // Create the function using raw SQL
  const { error } = await supabase.rpc('execute_sql', { query: createFunctionSql });
  if (error) {
    // If we can't create the function, try with the SQL endpoint directly
    const { error: directError } = await supabase.rpc('execute_sql', { 
      query: 'select 1' 
    }).catch(() => ({}));
    
    if (directError) {
      throw new Error(`Failed to create execute_sql function. Please create it manually in the Supabase SQL editor with:
      \n${createFunctionSql}\n`);
    }
  }
}

runMigration();
