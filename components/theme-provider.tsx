"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Load theme immediately on mount
    const loadTheme = async () => {
      // First, try to get theme from localStorage for instant application
      const localTheme = localStorage.getItem("theme")
      
      if (localTheme) {
        applyTheme(localTheme)
      }

      // Then try to get user's saved preference from database
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: settings } = await supabase
          .from("settings")
          .select("theme")
          .eq("user_id", user.id)
          .single()

        if (settings?.theme) {
          applyTheme(settings.theme)
        } else if (localTheme) {
          applyTheme(localTheme)
        } else {
          applyTheme("light")
        }
      } else if (!localTheme) {
        // No user and no local theme - default to light
        applyTheme("light")
      }
    }

    loadTheme()
    setMounted(true)
  }, [])

  const applyTheme = (theme: string) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return null
  }

  return <>{children}</>
}