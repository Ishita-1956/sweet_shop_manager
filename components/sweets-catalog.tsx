"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ShoppingBag, TrendingUp, Package } from "lucide-react"
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

// Function to get appropriate image URL based on product name and category
const getProductImage = (name: string, category: string): string => {
  const lowerName = name.toLowerCase()
  
  // Chocolate images
  if (category === "Chocolates" || lowerName.includes("chocolate")) {
    if (lowerName.includes("eclair")) {
      return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
    }
    if (lowerName.includes("truffle")) {
      return "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop"
    }
    if (lowerName.includes("dark")) {
      return "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=300&fit=crop"
    }
    return "https://images.unsplash.com/photo-1606312619070-d48b4dcd0bf7?w=400&h=300&fit=crop"
  }
  
  // Pastry images
  if (category === "Pastries" || lowerName.includes("pastry") || lowerName.includes("cake")) {
    if (lowerName.includes("croissant")) {
      return "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop"
    }
    if (lowerName.includes("macaron")) {
      return "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&h=300&fit=crop"
    }
    return "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=300&fit=crop"
  }
  
  // Candy images
  if (category === "Candies" || lowerName.includes("candy") || lowerName.includes("candies")) {
    if (lowerName.includes("caramel")) {
      return "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=300&fit=crop"
    }
    if (lowerName.includes("gummy")) {
      return "https://images.unsplash.com/photo-1629367494173-c78a56567877?w=400&h=300&fit=crop"
    }
    return "https://images.unsplash.com/photo-1499195333224-3ce974eecb47?w=400&h=300&fit=crop"
  }
  
  // Vegan images
  if (category === "Vegan") {
    return "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=300&fit=crop"
  }
  
  // Default sweet image
  return "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop"
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

    // Search by name or description
    if (searchQuery) {
      filtered = filtered.filter((sweet) => 
        sweet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sweet.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
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

    // Remove duplicates by ID
    const uniqueFiltered = filtered.reduce((acc: Sweet[], current) => {
      const exists = acc.find(item => item.id === current.id)
      if (!exists) {
        acc.push(current)
      }
      return acc
    }, [])

    setFilteredSweets(uniqueFiltered)
  }

  const handlePurchase = async (sweet: Sweet) => {
    if (sweet.stock === 0) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      toast({ 
        title: "Authentication Required", 
        description: "Please log in to make a purchase", 
        variant: "destructive" 
      })
      return
    }

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
      toast({ 
        title: "Purchase Successful! 🎉", 
        description: `${sweet.name} has been added to your orders`,
      })
      fetchSweets()
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Sold Out", color: "bg-gray-500 hover:bg-gray-500" }
    if (stock <= 10) return { label: "Low Stock", color: "bg-orange-500 hover:bg-orange-500" }
    return { label: "Available", color: "bg-green-500 hover:bg-green-500" }
  }

  const stats = {
    total: filteredSweets.length,
    inStock: filteredSweets.filter(s => s.stock > 0).length,
    lowStock: filteredSweets.filter(s => s.stock > 0 && s.stock <= 10).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-muted-foreground">Loading delicious sweets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Stock</CardTitle>
            <ShoppingBag className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inStock}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alert</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardTitle className="text-xl">Search Sweets</CardTitle>
          <CardDescription>Find the perfect sweet by name, category, or price range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Chocolates">🍫 Chocolates</SelectItem>
                  <SelectItem value="Pastries">🥐 Pastries</SelectItem>
                  <SelectItem value="Candies">🍬 Candies</SelectItem>
                  <SelectItem value="Vegan">🌱 Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Min Price ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                step="0.01"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Price ($)</label>
              <Input
                type="number"
                placeholder="100.00"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                step="0.01"
                className="h-11"
              />
            </div>
          </div>

          {(searchQuery || categoryFilter !== "All" || minPrice || maxPrice) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter("All")
                setMinPrice("")
                setMaxPrice("")
              }}
              className="w-full md:w-auto"
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Sweets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSweets.map((sweet) => {
          const stockStatus = getStockStatus(sweet.stock)
          const imageUrl = sweet.image_url || getProductImage(sweet.name, sweet.category)
          
          return (
            <Card key={sweet.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-video relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
                <Image 
                  src={imageUrl} 
                  alt={sweet.name} 
                  fill 
                  className="object-cover transition-transform duration-300 group-hover:scale-110" 
                  unoptimized
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                    {sweet.category}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight">{sweet.name}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2 text-sm">
                  {sweet.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-yellow-600">
                    ${sweet.price.toFixed(2)}
                  </span>
                  <Badge className={`${stockStatus.color} text-white`}>
                    {stockStatus.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Stock: {sweet.stock} units
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  onClick={() => handlePurchase(sweet)}
                  disabled={sweet.stock === 0}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-md transition-all duration-300"
                >
                  {sweet.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {filteredSweets.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No sweets found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}