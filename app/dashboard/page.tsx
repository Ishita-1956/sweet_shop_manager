"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, DollarSign, ShoppingCart } from "lucide-react"
import { SweetsCatalog } from "@/components/sweets-catalog"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSweets: 0,
    lowStockItems: 0,
    todaysSales: 0,
    pendingOrders: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()

    // Set up real-time subscription for stock updates
    const sweetsChannel = supabase
      .channel('dashboard-sweets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sweets'
        },
        (payload) => {
          console.log('Dashboard: Stock change detected:', payload)
          fetchStats()
        }
      )
      .subscribe()

    // Also listen to order changes
    const ordersChannel = supabase
      .channel('dashboard-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Dashboard: Order change detected:', payload)
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sweetsChannel)
      supabase.removeChannel(ordersChannel)
    }
  }, [])

  const fetchStats = async () => {
    setLoading(true)

    // Fetch sweets
    const { data: sweets } = await supabase.from("sweets").select("*")
    
    // Fetch pending orders
    const { data: orders } = await supabase.from("orders").select("*").eq("status", "pending")

    // Calculate today's sales
    const today = new Date().toISOString().split("T")[0]
    const { data: todayOrders } = await supabase
      .from("orders")
      .select("total_price")
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)

    const totalSweets = sweets?.length || 0
    const lowStockItems = sweets?.filter((sweet) => sweet.stock > 0 && sweet.stock <= 10).length || 0
    const pendingOrders = orders?.length || 0
    const todaysSales = todayOrders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0

    setStats({
      totalSweets,
      lowStockItems,
      todaysSales,
      pendingOrders,
    })

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your shop overview.</p>
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
            <p className="text-xs text-muted-foreground">Products in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todaysSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Revenue generated today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Orders to process</p>
          </CardContent>
        </Card>
      </div>

      {/* Sweets Catalog */}
      <SweetsCatalog />
    </div>
  )
}