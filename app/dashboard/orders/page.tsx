"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Package, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react"

type Order = {
  id: string
  user_id: string
  sweet_id: string | null
  sweet_name: string
  quantity: number
  total_price: number
  status: string
  created_at: string
  profiles?: {
    full_name: string
    email: string
  } | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<string>("")
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    // Get user role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    setCurrentUserRole(profile?.role || "user")

    // FIXED: Use proper join with profiles table
    // For admin: get all orders with user details
    // For regular user: get only their orders
    let query = supabase
      .from("orders")
      .select(`
        id,
        user_id,
        sweet_id,
        sweet_name,
        quantity,
        total_price,
        status,
        created_at,
        profiles!orders_user_id_fkey (
          full_name,
          email
        )
      `)

    // If not admin, filter to only show user's own orders
    if (profile?.role !== "admin") {
      query = query.eq("user_id", user.id)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" })
    } else {
      console.log("Fetched orders:", data)
      setOrders(data || [])
    }
    setLoading(false)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

    if (error) {
      toast({ title: "Error", description: "Failed to update order status", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Order status updated successfully" })
      fetchOrders()
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { 
        label: "Pending", 
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800", 
        icon: <Clock className="h-3 w-3" /> 
      },
      completed: {
        label: "Completed",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      cancelled: { 
        label: "Cancelled", 
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800", 
        icon: <XCircle className="h-3 w-3" /> 
      },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <Badge className={`${config.color} flex items-center gap-1 w-fit border`}>
        {config.icon}
        <span>{config.label}</span>
      </Badge>
    )
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
    revenue: orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + Number(o.total_price), 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">
          {currentUserRole === "admin"
            ? "Manage all customer orders and update their status"
            : "View your order history"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time orders</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 dark:border-l-yellow-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 dark:border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully fulfilled</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 dark:border-l-emerald-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">From completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 border-b dark:border-gray-700">
          <CardTitle>Order History</CardTitle>
          <CardDescription className="dark:text-gray-400">
            {currentUserRole === "admin" ? "All orders across the system" : "Your purchase history"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {orders.length > 0 ? (
            <div className="rounded-md border dark:border-gray-700 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700 hover:bg-transparent">
                    <TableHead className="dark:text-gray-300">Order ID</TableHead>
                    {currentUserRole === "admin" && <TableHead className="dark:text-gray-300">Customer</TableHead>}
                    <TableHead className="dark:text-gray-300">Product</TableHead>
                    <TableHead className="dark:text-gray-300">Quantity</TableHead>
                    <TableHead className="dark:text-gray-300">Total</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="dark:text-gray-300">Date</TableHead>
                    {currentUserRole === "admin" && <TableHead className="dark:text-gray-300">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    // Extract profile data safely
                    const customerName = order.profiles?.full_name || "Guest User"
                    const customerEmail = order.profiles?.email || "No email"
                    
                    return (
                      <TableRow key={order.id} className="dark:border-gray-700">
                        <TableCell className="font-mono text-xs dark:text-gray-300">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        {currentUserRole === "admin" && (
                          <TableCell>
                            <div>
                              <div className="font-medium dark:text-gray-100">
                                {customerName}
                              </div>
                              <div className="text-xs text-muted-foreground dark:text-gray-500">
                                {customerEmail}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="font-medium dark:text-gray-100">{order.sweet_name}</TableCell>
                        <TableCell className="dark:text-gray-300">{order.quantity}</TableCell>
                        <TableCell className="font-semibold text-yellow-600 dark:text-yellow-400">
                          ${Number(order.total_price).toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-sm dark:text-gray-300">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        {currentUserRole === "admin" && (
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                              disabled={order.status === "cancelled"}
                            >
                              <SelectTrigger className="w-32 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                <SelectItem value="pending" className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  Pending
                                </SelectItem>
                                <SelectItem value="completed" className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  Completed
                                </SelectItem>
                                <SelectItem value="cancelled" className="dark:text-gray-100 dark:focus:bg-gray-700">
                                  Cancelled
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg dark:border-gray-700">
              <Package className="h-16 w-16 text-muted-foreground dark:text-gray-600 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground dark:text-gray-400 mb-2">
                {currentUserRole === "admin" ? "No orders yet" : "You haven't made any purchases yet"}
              </p>
              <p className="text-sm text-muted-foreground dark:text-gray-500">
                {currentUserRole === "admin" 
                  ? "Orders will appear here once customers start making purchases" 
                  : "Start shopping to see your order history here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}