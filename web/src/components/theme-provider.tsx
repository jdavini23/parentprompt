"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

/**
 * This component provides theme functionality with hydration mismatch prevention
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force the page to be in light mode on initial render to avoid hydration mismatches
  // We'll only enable theme switching after the initial client-side render
  const [mounted, setMounted] = React.useState(false)
  
  // Use forcedTheme for server-side rendering to avoid hydration mismatches
  const themeProps: ThemeProviderProps = {
    // Force light theme during SSR and initial render
    forcedTheme: mounted ? undefined : "light",
    // Once mounted, we'll use these settings
    defaultTheme: "light",
    // Use data-theme attribute instead of class to avoid conflicts
    attribute: "data-theme",
    // Other props
    enableSystem: true,
    disableTransitionOnChange: false,
    ...props,
  }
  
  // After initial render, enable theme switching
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  return (
    <>
      {/* Add a script to prevent flash of wrong theme */}
      {!mounted && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root { color-scheme: light !important; }
          html { color-scheme: light !important; }
          html.dark { color-scheme: dark !important; }
        `}} />
      )}
      
      <NextThemesProvider {...themeProps}>
        {children}
      </NextThemesProvider>
    </>
  )
}
