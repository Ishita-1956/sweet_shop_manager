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
    const { data: profilesData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
    const { data: orderCounts } = await supabase.from("orders").select("user_id")

    const counts = orderCounts?.reduce(
      (acc, order) => {
        acc[order.user_id] = (acc[order.user_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    setProfiles(profilesData || [])
    setUserOrderCounts(counts || {})
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Customer information and account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Joined</TableHead>
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
                    : profile.email[0].toUpperCase()

                  return (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-yellow-100 text-yellow-900">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{profile.full_name || "No name"}</div>
                            <div className="text-xs text-muted-foreground">ID: {profile.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <Badge className={profile.role === "admin" ? "bg-yellow-100 text-yellow-800" : ""}>
                          {profile.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{userOrderCounts[profile.id] || 0} orders</TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
