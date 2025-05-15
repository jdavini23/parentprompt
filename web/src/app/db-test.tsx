"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase"

// Diagnostic function to test database connectivity
async function testDatabaseConnection() {
  console.log("Testing database connection...")
  try {
    // Get admin client
    const adminClient = getSupabaseClient(true)
    console.log("Admin client obtained")
    
    // Test connection by checking if tables exist
    console.log("Checking if users table exists...")
    const { data: usersData, error: usersError } = await adminClient
      .from('users')
      .select('count')
      .limit(1)
    
    console.log("Users table check result:", { data: usersData, error: usersError })
    
    console.log("Checking if children table exists...")
    const { data: childrenData, error: childrenError } = await adminClient
      .from('children')
      .select('count')
      .limit(1)
    
    console.log("Children table check result:", { data: childrenData, error: childrenError })
    
    // Check service role key
    console.log("Checking service role key...")
    const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''
    console.log("Service role key available:", Boolean(serviceKey))
    
    return {
      usersTable: { exists: !usersError, data: usersData, error: usersError },
      childrenTable: { exists: !childrenError, data: childrenData, error: childrenError },
      serviceKey: Boolean(serviceKey)
    }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export default function DatabaseTest() {
  const [diagnosisRunning, setDiagnosisRunning] = useState(false)
  const [diagnosisResults, setDiagnosisResults] = useState<any>(null)

  const runDiagnostics = async () => {
    setDiagnosisRunning(true)
    try {
      const results = await testDatabaseConnection()
      setDiagnosisResults(results)
      console.log("Diagnosis complete:", results)
    } catch (error) {
      console.error("Diagnosis failed:", error)
      setDiagnosisResults({ error: String(error) })
    } finally {
      setDiagnosisRunning(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle>Database Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="mb-4">
                This page helps diagnose issues with the Supabase database connection. 
                Click the button below to run diagnostics and check if the database tables exist.
              </p>
              
              <Button 
                onClick={runDiagnostics} 
                disabled={diagnosisRunning}
              >
                {diagnosisRunning ? "Running Tests..." : "Test Database Connection"}
              </Button>
            </div>
            
            {diagnosisResults && (
              <div className="mt-4 p-4 border rounded-md bg-slate-50">
                <h3 className="font-medium mb-2">Database Diagnosis Results:</h3>
                <pre className="text-xs overflow-auto p-2 bg-slate-100 rounded">
                  {JSON.stringify(diagnosisResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
