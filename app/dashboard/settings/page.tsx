"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { SettingsIcon, User, Store, Moon, Sun } from "lucide-react"

type Profile = {
  id: string
  email: string
  full_name: string
  role: string
}

type Settings = {
  id: string
  user_id: string
  shop_name: string
  currency: string
  low_stock_threshold: number
  theme: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [fullName, setFullName] = useState("")
  const [shopName, setShopName] = useState("Sweet Shop Manager")
  const [currency, setCurrency] = useState("USD")
  const [lowStockThreshold, setLowStockThreshold] = useState(10)
  const [theme, setTheme] = useState("light")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  const fetchData = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Fetch profile
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (profileData) {
      setProfile(profileData)
      setFullName(profileData.full_name || "")
    }

    // Fetch settings
    const { data: settingsData } = await supabase.from("settings").select("*").eq("user_id", user.id).single()

    if (settingsData) {
      setSettings(settingsData)
      setShopName(settingsData.shop_name || "Sweet Shop Manager")
      setCurrency(settingsData.currency || "USD")
      setLowStockThreshold(settingsData.low_stock_threshold || 10)
      setTheme(settingsData.theme || "light")
    }

    setLoading(false)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)

    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id)

    if (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Profile updated successfully" })
      fetchData()
    }

    setSaving(false)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)

    const { error } = await supabase
      .from("settings")
      .update({
        shop_name: shopName,
        currency: currency,
        low_stock_threshold: lowStockThreshold,
        theme: theme,
      })
      .eq("id", settings.id)

    if (error) {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Settings updated successfully" })
      fetchData()
    }

    setSaving(false)
  }

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={profile?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={profile?.role || ""} disabled className="bg-muted capitalize" />
              <p className="text-xs text-muted-foreground">Role is assigned by administrators</p>
            </div>

            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Shop Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            <CardTitle>Shop Settings</CardTitle>
          </div>
          <CardDescription>Configure your shop preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                type="text"
                placeholder="Sweet Shop Manager"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="1"
                max="100"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Products with stock below this level will be marked as low stock
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <Label htmlFor="theme">Dark Mode</Label>
                </div>
                <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
              </div>
              <Switch
                id="theme"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            <CardTitle>About</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Version:</strong> 1.0.0
          </p>
          <p>
            <strong>Built with:</strong> Next.js, TypeScript, Supabase, Tailwind CSS
          </p>
          <p>
            <strong>Description:</strong> A comprehensive sweet shop management system for inventory tracking, order
            management, and customer relations.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
