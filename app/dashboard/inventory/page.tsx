"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, AlertTriangle, ShoppingCart, DollarSign, Lock } from "lucide-react"
import { InventoryTable } from "@/components/inventory-table"
import { AddSweetPanel } from "@/components/add-sweet-panel"
import Link from "next/link"

export default function InventoryPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSweets: 0,
    lowStockItems: 0,
    activeOrders: 0,
    totalRevenue: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role === "admin") {
      setIsAdmin(true)
      await fetchStats()
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    const { data: sweets } = await supabase.from("sweets").select("*")
    const { data: orders } = await supabase.from("orders").select("*").eq("status", "completed")

    setStats({
      totalSweets: sweets?.length || 0,
      lowStockItems: sweets?.filter((sweet) => sweet.stock > 0 && sweet.stock <= 10).length || 0,
      activeOrders: sweets?.reduce((sum, sweet) => sum + sweet.stock, 0) || 0,
      totalRevenue: orders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0,
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!isAdmin) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto text-center py-16">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
            <Lock className="h-10 w-10 text-yellow-600" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Access Restricted</h1>
          <p className="text-muted-foreground text-lg">
            Only administrators have access to the inventory management page.
          </p>
        </div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              If you need to manage inventory, please sign in with an admin account.
            </p>
            <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Link href="/auth/login">Sign in as Admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">Manage your sweet shop inventory and add new products</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sweets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSweets}</div>
            <p className="text-xs text-muted-foreground">Unique products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stock</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">Total units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Sweet Panel */}
      <AddSweetPanel />

      {/* Inventory Table */}
      <InventoryTable />
    </div>
  )
}
