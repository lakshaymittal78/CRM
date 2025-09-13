"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Search, Filter, Download, Eye, Clock } from "lucide-react"
import { apiClient } from "@/lib/api"

interface CampaignLog {
  id: string
  campaignId: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: "sent" | "failed"
  timestamp: string
  errorMessage?: string
  deliveryAttempts: number
}

interface CampaignLogsViewerProps {
  campaignId?: string
  showFilters?: boolean
}

export function CampaignLogsViewer({ campaignId, showFilters = true }: CampaignLogsViewerProps) {
  const [logs, setLogs] = useState<CampaignLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  })
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  })

  const fetchLogs = async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (campaignId) params.append("campaignId", campaignId)
      if (filters.status !== "all") params.append("status", filters.status)
      params.append("limit", pagination.limit.toString())
      params.append("offset", reset ? "0" : pagination.offset.toString())

      const response = await apiClient.getCampaignLogs(campaignId)

      if (reset) {
        setLogs(response.logs || [])
      } else {
        setLogs((prev) => [...prev, ...(response.logs || [])])
      }

      setPagination(response.pagination || { total: 0, limit: 50, offset: 0, hasMore: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, offset: 0 }))
  }

  const loadMore = () => {
    setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        log.customerName.toLowerCase().includes(searchLower) ||
        log.customerEmail.toLowerCase().includes(searchLower) ||
        log.customerPhone.includes(filters.search)
      )
    }
    return true
  })

  useEffect(() => {
    fetchLogs(true)
  }, [campaignId, filters.status])

  useEffect(() => {
    if (pagination.offset > 0) {
      fetchLogs(false)
    }
  }, [pagination.offset])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Campaign Delivery Logs</CardTitle>
            <CardDescription>
              Detailed logs of campaign delivery attempts and results
              {campaignId && " for this campaign"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by customer name, email, or phone..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading logs...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No logs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{log.customerName}</h4>
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Email: {log.customerEmail}</div>
                      <div>Phone: {log.customerPhone}</div>
                      {log.deliveryAttempts > 1 && <div>Delivery attempts: {log.deliveryAttempts}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                </div>

                {log.errorMessage && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <strong>Error:</strong> {log.errorMessage}
                  </div>
                )}
              </div>
            ))}

            {pagination.hasMore && (
              <div className="text-center pt-4">
                <Button variant="outline" onClick={loadMore} disabled={loading}>
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}

            <div className="text-center text-xs text-gray-500 pt-2">
              Showing {filteredLogs.length} of {pagination.total} logs
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
