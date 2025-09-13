"use client"

import { useState, useEffect } from "react"
import type { Customer, CustomerFormData } from "@/lib/types"

interface UseCustomersReturn {
  customers: Customer[]
  loading: boolean
  error: string | null
  total: number
  createCustomer: (data: CustomerFormData) => Promise<Customer | null>
  updateCustomer: (id: string, data: Partial<CustomerFormData>) => Promise<Customer | null>
  deleteCustomer: (id: string) => Promise<boolean>
  searchCustomers: (query: string) => void
  refreshCustomers: () => void
}

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchCustomers = async (search?: string) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (search) params.append("search", search)

      const response = await fetch(`/api/customers?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch customers")
      }

      setCustomers(data.customers)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (data: CustomerFormData): Promise<Customer | null> => {
    try {
      setError(null)

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create customer")
      }

      // Add to local state
      setCustomers((prev) => [result, ...prev])
      setTotal((prev) => prev + 1)

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return null
    }
  }

  const updateCustomer = async (id: string, data: Partial<CustomerFormData>): Promise<Customer | null> => {
    try {
      setError(null)

      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update customer")
      }

      // Update local state
      setCustomers((prev) => prev.map((customer) => (customer.id === id ? result : customer)))

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return null
    }
  }

  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete customer")
      }

      // Remove from local state
      setCustomers((prev) => prev.filter((customer) => customer.id !== id))
      setTotal((prev) => prev - 1)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const searchCustomers = (query: string) => {
    setSearchQuery(query)
    fetchCustomers(query)
  }

  const refreshCustomers = () => {
    fetchCustomers(searchQuery)
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return {
    customers,
    loading,
    error,
    total,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    refreshCustomers,
  }
}
