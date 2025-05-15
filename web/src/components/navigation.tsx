"use client"

import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Clock, Star, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navigation() {
  const { signOut, user } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    { href: "/", label: "Today", icon: <Home className="w-5 h-5" /> },
    { href: "/history", label: "History", icon: <Clock className="w-5 h-5" /> },
    { href: "/favorites", label: "Favorites", icon: <Star className="w-5 h-5" /> },
  ]

  return (
    <>
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t md:hidden">
        <div className="flex items-center justify-around h-16">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                pathname === route.href ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <>
                {route.icon}
                <span className="mt-1 text-xs">{route.label}</span>
              </>
            </Link>
          ))}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-1">
                <Menu className="w-5 h-5" />
                <span className="mt-1 text-xs">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col h-full py-6">
                <div className="flex-1 space-y-4">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      className="block p-2 rounded-md hover:bg-muted"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <a
                      href="https://stepintostorytime.com"
                      className="block p-2 rounded-md hover:bg-muted"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                    >
                      Generate Story
                    </a>
                  </div>
                </div>
                {user && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                  >
                    Sign Out
                  </Button>
                )}
                {!user && (
                  <Link href="/login" passHref>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:bg-white md:border-r">
        <div className="flex flex-col flex-1 h-full py-6">
          <div className="px-6 mb-8">
            <h1 className="text-2xl font-bold">ParentPrompt</h1>
          </div>
          <nav className="flex-1 px-3 space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center px-3 py-2 rounded-md ${
                  pathname === route.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                }`}
              >
                <>
                  {route.icon}
                  <span className="ml-3">{route.label}</span>
                </>
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t">
              <Link
                href="/profile"
                className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-primary"
              >
                Profile Settings
              </Link>
              <a
                href="https://stepintostorytime.com"
                className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Generate Story
              </a>
            </div>
          </nav>
          <div className="px-3 mt-auto">
            {user && (
              <Button variant="outline" className="w-full" onClick={() => signOut()}>
                Sign Out
              </Button>
            )}
            {!user && (
              <Link href="/login" passHref>
                <Button variant="default" className="w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
