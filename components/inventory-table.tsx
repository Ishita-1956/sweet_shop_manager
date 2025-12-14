"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2, Download, Plus, X, Upload } from "lucide-react"
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

export function InventoryTable() {
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null)
  const [editForm, setEditForm] = useState<Partial<Sweet>>({})
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [restockingSweet, setRestockingSweet] = useState<Sweet | null>(null)
  const [restockAmount, setRestockAmount] = useState(0)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchSweets()
  }, [])

  const fetchSweets = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("sweets").select("*").order("name")

    if (error) {
      toast({ title: "Error", description: "Failed to load inventory", variant: "destructive" })
    } else {
      setSweets(data || [])
    }
    setLoading(false)
  }

  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet)
    setEditForm(sweet)
    setEditImagePreview(null)
    setEditImageFile(null)
  }

  const uploadEditImage = async (): Promise<string> => {
    if (!editImageFile) return editForm.image_url || "/placeholder.svg?height=200&width=200"

    const fileExt = editImageFile.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `sweets/${fileName}`

    const { error } = await supabase.storage.from("images").upload(filePath, editImageFile)

    if (error) {
      toast({ title: "Warning", description: "Failed to upload image, keeping current", variant: "destructive" })
      return editForm.image_url || "/placeholder.svg?height=200&width=200"
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath)

    return publicUrl
  }

  const handleUpdate = async () => {
    if (!editingSweet) return

    const finalImageUrl = await uploadEditImage()

    const { error } = await supabase
      .from("sweets")
      .update({
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        price: editForm.price,
        stock: editForm.stock,
        image_url: finalImageUrl,
      })
      .eq("id", editingSweet.id)

    if (error) {
      toast({ title: "Error", description: "Failed to update sweet", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Sweet updated successfully" })
      setEditingSweet(null)
      setEditImageFile(null)
      setEditImagePreview(null)
      fetchSweets()
    }
  }

  const handleRestock = async () => {
    if (!restockingSweet || restockAmount <= 0) return

    const newStock = restockingSweet.stock + restockAmount

    const { error } = await supabase.from("sweets").update({ stock: newStock }).eq("id", restockingSweet.id)

    if (error) {
      toast({ title: "Error", description: "Failed to restock", variant: "destructive" })
    } else {
      toast({
        title: "Success",
        description: `Added ${restockAmount} units. New stock: ${newStock}`,
      })
      setRestockingSweet(null)
      setRestockAmount(0)
      fetchSweets()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sweet?")) return

    const { error } = await supabase.from("sweets").delete().eq("id", id)

    if (error) {
      toast({ title: "Error", description: "Failed to delete sweet", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Sweet deleted successfully" })
      fetchSweets()
    }
  }

  const exportData = () => {
    const csv = [
      ["ID", "Name", "Category", "Price", "Stock"],
      ...sweets.map((sweet) => [sweet.id, sweet.name, sweet.category, sweet.price, sweet.stock]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "inventory.csv"
    a.click()
  }

  const getStockIndicator = (stock: number) => {
    if (stock === 0) return { label: "Out", color: "bg-gray-800 dark:bg-gray-300", width: "0%" }
    if (stock <= 10) return { label: "Low", color: "bg-orange-500", width: "33%" }
    if (stock <= 30) return { label: "OK", color: "bg-yellow-500", width: "66%" }
    return { label: "High", color: "bg-green-500", width: "100%" }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Chocolates: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
      Pastries: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
      Candies: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      Vegan: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return <div className="text-center py-8">Loading inventory...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory Table</CardTitle>
            <CardDescription>Manage all your sweet products in one place</CardDescription>
          </div>
          <Button onClick={exportData} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sweets.map((sweet) => {
                const stockIndicator = getStockIndicator(sweet.stock)
                return (
                  <TableRow key={sweet.id}>
                    <TableCell>
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={sweet.image_url || "/placeholder.svg"}
                          alt={sweet.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sweet.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{sweet.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{sweet.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(sweet.category)}>{sweet.category}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">${sweet.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${stockIndicator.color}`} style={{ width: stockIndicator.width }} />
                          </div>
                          <span
                            className={`text-xs font-medium ${sweet.stock === 0 ? "text-gray-800 dark:text-gray-300" : ""}`}
                          >
                            {stockIndicator.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{sweet.stock} units</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog
                          open={restockingSweet?.id === sweet.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setRestockingSweet(null)
                              setRestockAmount(0)
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setRestockingSweet(sweet)
                                setRestockAmount(10)
                              }}
                              title="Restock"
                            >
                              <Plus className="h-4 w-4 text-green-600" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Restock {sweet.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Current Stock</p>
                                <p className="text-2xl font-bold">{sweet.stock} units</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Add Quantity</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={restockAmount}
                                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                                />
                              </div>
                              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm text-muted-foreground">New Stock</p>
                                <p className="text-2xl font-bold text-green-600">{sweet.stock + restockAmount} units</p>
                              </div>
                              <Button
                                onClick={handleRestock}
                                className="w-full bg-green-500 hover:bg-green-600 text-white"
                              >
                                Confirm Restock
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={editingSweet?.id === sweet.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingSweet(null)
                              setEditImageFile(null)
                              setEditImagePreview(null)
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(sweet)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Sweet</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Name</Label>
                                  <Input
                                    value={editForm.name || ""}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Category</Label>
                                  <Select
                                    value={editForm.category}
                                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Chocolates">Chocolates</SelectItem>
                                      <SelectItem value="Pastries">Pastries</SelectItem>
                                      <SelectItem value="Candies">Candies</SelectItem>
                                      <SelectItem value="Vegan">Vegan</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Price</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.price || ""}
                                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Stock</Label>
                                  <Input
                                    type="number"
                                    value={editForm.stock || ""}
                                    onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    value={editForm.description || ""}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={2}
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <Label>Product Image</Label>
                                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                    {editImagePreview ? (
                                      <div className="relative">
                                        <Image
                                          src={editImagePreview || "/placeholder.svg"}
                                          alt="Preview"
                                          width={200}
                                          height={200}
                                          className="mx-auto rounded-lg object-cover"
                                        />
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="destructive"
                                          className="absolute top-2 right-2"
                                          onClick={() => {
                                            setEditImageFile(null)
                                            setEditImagePreview(null)
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : editForm.image_url ? (
                                      <div className="relative">
                                        <Image
                                          src={editForm.image_url || "/placeholder.svg"}
                                          alt="Current"
                                          width={200}
                                          height={200}
                                          className="mx-auto rounded-lg object-cover"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="mt-2 bg-transparent"
                                          onClick={() => document.getElementById("edit-file-upload")?.click()}
                                        >
                                          <Upload className="h-4 w-4 mr-2" />
                                          Change Image
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById("edit-file-upload")?.click()}
                                      >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Image
                                      </Button>
                                    )}
                                    <input
                                      id="edit-file-upload"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file && file.type.startsWith("image/")) {
                                          setEditImageFile(file)
                                          const reader = new FileReader()
                                          reader.onloadend = () => {
                                            setEditImagePreview(reader.result as string)
                                          }
                                          reader.readAsDataURL(file)
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={handleUpdate}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                              >
                                Update Sweet
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sweet.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
