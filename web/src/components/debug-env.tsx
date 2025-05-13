"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isUsingRealCredentials } from "@/lib/supabase"

export function DebugEnv() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({})
  const [showFullUrl, setShowFullUrl] = useState(false)

  useEffect(() => {
    // Only collect public environment variables
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "[REDACTED]" : undefined,
    })
  }, [])

  return (
    <Card className="mb-8 border-2 border-yellow-300">
      <CardHeader className="bg-yellow-50">
        <CardTitle className="text-yellow-800">Environment Variables Debug</CardTitle>
        <CardDescription>
          Your Supabase connection is {isUsingRealCredentials ? "properly configured" : "using placeholder values"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-md bg-yellow-50">
          <p className="font-medium text-yellow-800">
            {isUsingRealCredentials
              ? "✅ Using real Supabase credentials"
              : "⚠️ Using placeholder Supabase credentials - authentication and database operations will not work"}
          </p>
        </div>

        <div className="space-y-2">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-mono">{key}:</span>
              <span
                className={`font-mono ${
                  value
                    ? key.includes("URL") && !value.startsWith("http")
                      ? "text-red-600"
                      : "text-green-600"
                    : "text-red-600"
                }`}
              >
                {value
                  ? key.includes("KEY")
                    ? "[REDACTED]"
                    : showFullUrl
                      ? value
                      : value.substring(0, 20) + "..."
                  : "Not set"}
              </span>
            </div>
          ))}
          {envVars.NEXT_PUBLIC_SUPABASE_URL && (
            <Button variant="outline" size="sm" onClick={() => setShowFullUrl(!showFullUrl)}>
              {showFullUrl ? "Hide Full URL" : "Show Full URL"}
            </Button>
          )}
        </div>

        <div className="p-4 text-sm border rounded-md bg-blue-50 text-blue-800">
          <h3 className="mb-2 font-semibold">How to fix:</h3>
          <ol className="pl-5 space-y-1 list-decimal">
            <li>
              Make sure you have set <code className="px-1 bg-blue-100 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="px-1 bg-blue-100 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment
              variables.
            </li>
            <li>
              The Supabase URL should start with <code className="px-1 bg-blue-100 rounded">https://</code> and end with{" "}
              <code className="px-1 bg-blue-100 rounded">.supabase.co</code>
            </li>
            <li>
              For Next.js, client-side environment variables must be prefixed with{" "}
              <code className="px-1 bg-blue-100 rounded">NEXT_PUBLIC_</code>
            </li>
          </ol>
        </div>
      </CardContent>
      <CardFooter className="bg-yellow-50">
        <p className="text-sm text-yellow-800">
          This debug card will only appear in development mode and when environment variables are missing.
        </p>
      </CardFooter>
    </Card>
  )
}
