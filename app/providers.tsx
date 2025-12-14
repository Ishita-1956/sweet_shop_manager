"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)

    // Load theme from database or localStorage
    const loadTheme = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: settings } = await supabase.from("settings").select("theme").eq("user_id", user.id).single()

        const theme = settings?.theme || localStorage.getItem("theme") || "light"
        applyTheme(theme)
      } else {
        const theme = localStorage.getItem("theme") || "light"
        applyTheme(theme)
      }
    }

    loadTheme()
  }, [])

  const applyTheme = (theme: string) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }

  if (!mounted) {
    return null
  }

  return <>{children}</>
}
