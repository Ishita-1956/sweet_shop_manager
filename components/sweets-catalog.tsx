"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

type Sweet = {
  id: string
  name: string
  description: string
  category: string
  price: number
  stock: number
  image_url: string
}

export function SweetsCatalog() {
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchSweets()
  }, [])

  useEffect(() => {
    filterSweets()
  }, [searchQuery, categoryFilter, minPrice, maxPrice, sweets])

  const fetchSweets = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("sweets").select("*").order("name")

    if (error) {
      toast({ title: "Error", description: "Failed to load sweets", variant: "destructive" })
    } else {
      setSweets(data || [])
    }
    setLoading(false)
  }

  const filterSweets = () => {
    let filtered = [...sweets]

    // Search by name
    if (searchQuery) {
      filtered = filtered.filter((sweet) => sweet.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by category
    if (categoryFilter !== "All") {
      filtered = filtered.filter((sweet) => sweet.category === categoryFilter)
    }

    // Filter by price range
    if (minPrice) {
      filtered = filtered.filter((sweet) => sweet.price >= Number(minPrice))
    }
    if (maxPrice) {
      filtered = filtered.filter((sweet) => sweet.price <= Number(maxPrice))
    }

    setFilteredSweets(filtered)
  }

  const handlePurchase = async (sweet: Sweet) => {
    if (sweet.stock === 0) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Create order
    const { error: orderError } = await supabase.from("orders").insert({
      user_id: user.id,
      sweet_id: sweet.id,
      sweet_name: sweet.name,
      quantity: 1,
      total_price: sweet.price,
      status: "pending",
    })

    if (orderError) {
      toast({ title: "Error", description: "Failed to create order", variant: "destructive" })
      return
    }

    // Update stock
    const { error: stockError } = await supabase
      .from("sweets")
      .update({ stock: sweet.stock - 1 })
      .eq("id", sweet.id)

    if (stockError) {
      toast({ title: "Error", description: "Failed to update stock", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Purchase successful!" })
      fetchSweets()
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Sold Out", color: "bg-gray-500" }
    if (stock <= 10) return { label: "Low Stock", color: "bg-orange-500" }
    return { label: "Available", color: "bg-green-500" }
  }

  if (loading) {
    return <div className="text-center py-8">Loading sweets...</div>
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Sweets</CardTitle>
          <CardDescription>Find the perfect sweet by name, category, or price range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Chocolates">Chocolates</SelectItem>
                  <SelectItem value="Pastries">Pastries</SelectItem>
                  <SelectItem value="Candies">Candies</SelectItem>
                  <SelectItem value="Vegan">Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Min Price</label>
              <Input
                type="number"
                placeholder="$0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Price</label>
              <Input
                type="number"
                placeholder="$100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sweets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSweets.map((sweet) => {
          const stockStatus = getStockStatus(sweet.stock)
          return (
            <Card key={sweet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative bg-gray-100">
                <Image src={sweet.image_url || "/placeholder.svg"} alt={sweet.name} fill className="object-cover" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{sweet.name}</CardTitle>
                  <Badge variant="secondary">{sweet.category}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{sweet.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${sweet.price.toFixed(2)}</span>
                  <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Stock: {sweet.stock} units</p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handlePurchase(sweet)}
                  disabled={sweet.stock === 0}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  {sweet.stock === 0 ? "Out of Stock" : "Purchase"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {filteredSweets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sweets found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
