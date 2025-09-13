"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Edit, Trash2, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useCustomers } from "@/hooks/use-customers"
import type { CustomerFormData } from "@/lib/types"

export function CustomerManagement() {
  const { customers, loading, error, total, createCustomer, updateCustomer, deleteCustomer, searchCustomers } =
    useCustomers()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    totalSpend: "",
    lastPurchaseDate: "",
    location: "", // Added location field to form state
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      totalSpend: "",
      lastPurchaseDate: "",
      location: "", // Reset location field
    })
    setFormError(null)
    setSuccessMessage(null)
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    const result = await createCustomer(formData)

    if (result) {
      setSuccessMessage("Customer added successfully!")
      resetForm()
      setShowAddForm(false)
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      setFormError("Failed to add customer. Please try again.")
    }

    setFormLoading(false)
  }

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer) return

    setFormLoading(true)
    setFormError(null)

    const result = await updateCustomer(editingCustomer, formData)

    if (result) {
      setSuccessMessage("Customer updated successfully!")
      resetForm()
      setEditingCustomer(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      setFormError("Failed to update customer. Please try again.")
    }

    setFormLoading(false)
  }

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return
    }

    const success = await deleteCustomer(id)

    if (success) {
      setSuccessMessage("Customer deleted successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const startEdit = (customer: any) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      totalSpend: customer.totalSpend.toString(),
      lastPurchaseDate: customer.lastPurchaseDate || "",
      location: customer.location || "", // Include location in edit form
    })
    setEditingCustomer(customer.id)
    setShowAddForm(true)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    searchCustomers(value)
  }

  const cancelForm = () => {
    resetForm()
    setShowAddForm(false)
    setEditingCustomer(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your customer database and track their purchase history.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</CardTitle>
            <CardDescription>
              {editingCustomer
                ? "Update customer details in your database."
                : "Enter customer details to add them to your database."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{formError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={editingCustomer ? handleEditCustomer : handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91-9876543210"
                    required
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="totalSpend">Total Spend (₹)</Label>
                  <Input
                    id="totalSpend"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalSpend}
                    onChange={(e) => setFormData({ ...formData, totalSpend: e.target.value })}
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastPurchaseDate">Last Purchase Date</Label>
                  <Input
                    id="lastPurchaseDate"
                    type="date"
                    value={formData.lastPurchaseDate}
                    onChange={(e) => setFormData({ ...formData, lastPurchaseDate: e.target.value })}
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                    disabled={formLoading}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCustomer ? "Update Customer" : "Add Customer"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm} disabled={formLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Customers ({loading ? "..." : total})</CardTitle>
              <CardDescription>All customers in your database</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64"
                disabled={loading}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading customers...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {searchTerm ? "No customers found matching your search." : "No customers yet."}
              </div>
              {!searchTerm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Customer
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Total Spend</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Last Purchase</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Location</th>{" "}
                    {/* Added location column */}
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{customer.name}</td>
                      <td className="py-3 px-4 text-gray-600">{customer.email}</td>
                      <td className="py-3 px-4 text-gray-600">{customer.phone}</td>
                      <td className="py-3 px-4 text-gray-600">₹{customer.totalSpend.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{customer.location || "Not specified"}</td>{" "}
                      {/* Display location */}
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(customer)} disabled={formLoading}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                            disabled={formLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
