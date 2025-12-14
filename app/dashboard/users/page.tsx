"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, Shield, Lock } from "lucide-react"
import Link from "next/link"

type Profile = {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

export default function UsersPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [userOrderCounts, setUserOrderCounts] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    if (!isAdmin) return

    // Real-time subscription for profile changes
    const profilesChannel = supabase
      .channel('users-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Users page: Profile change detected:', payload)
          fetchUsers()
        }
      )
      .subscribe()

    // Real-time subscription for order changes
    const ordersChannel = supabase
      .channel('users-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Users page: Order change detected:', payload)
          fetchUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profilesChannel)
      supabase.removeChannel(ordersChannel)
    }
  }, [isAdmin])

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
      await fetchUsers()
    }
    setLoading(false)
  }

  const fetchUsers = async () => {
    console.log('Fetching all users and their order counts...')
    
    // Fetch all profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return
    }

    // Fetch all orders to count per user
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("user_id")

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
    }

    // Count orders per user
    const counts = orders?.reduce(
      (acc, order) => {
        acc[order.user_id] = (acc[order.user_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    console.log('Users fetched:', profilesData?.length)
    console.log('Order counts:', counts)

    setProfiles(profilesData || [])
    setUserOrderCounts(counts || {})
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
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
          <p className="text-muted-foreground text-lg">Only administrators have access to the users management page.</p>
        </div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              If you need to manage users, please sign in with an admin account.
            </p>
            <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Link href="/auth/login">Sign in as Admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = {
    total: profiles.length,
    admins: profiles.filter((p) => p.role === "admin").length,
    users: profiles.filter((p) => p.role === "user").length,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Users</h1>
        <p className="text-muted-foreground">Manage customer accounts and view user activity</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground mt-1">System administrators</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground mt-1">Regular users</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 border-b">
          <CardTitle>All Users</CardTitle>
          <CardDescription>Complete list of registered users with their details</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {profiles.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>User</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => {
                    const initials = profile.full_name
                      ? profile.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : profile.email.slice(0, 2).toUpperCase()

                    return (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-semibold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{profile.full_name || "No name set"}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                ID: {profile.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{profile.email}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{profile.full_name || "—"}</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              profile.role === "admin" 
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200" 
                                : "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200"
                            }
                          >
                            {profile.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                            {profile.role === "user" && <UserCheck className="h-3 w-3 mr-1" />}
                            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                              {userOrderCounts[profile.id] || 0}
                            </span>
                            <span className="text-xs text-muted-foreground">orders</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(profile.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No users found</p>
              <p className="text-sm text-muted-foreground">Users will appear here once they register</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}