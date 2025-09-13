"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, Send, TrendingUp, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface DashboardStats {
  totalCustomers: number
  activeSegments: number
  campaignsSent: number
  successRate: number
}

interface ActivityItem {
  id: string
  type: 'customer' | 'campaign' | 'segment'
  message: string
  timestamp: string
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch dashboard statistics
        const [customersRes, segmentsRes, campaignsRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/segments'),
          fetch('/api/campaigns')
        ])

        if (!customersRes.ok || !segmentsRes.ok || !campaignsRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const [customers, segments, campaigns] = await Promise.all([
          customersRes.json(),
          segmentsRes.json(),
          campaignsRes.json()
        ])

        // Calculate stats from API data
        const totalCustomers = customers.length || 0
        const activeSegments = segments.length || 0
        const campaignsSent = campaigns.length || 0
        
        // Calculate success rate (you might need to adjust this based on your campaign data structure)
        const successfulCampaigns = campaigns.filter((c: any) => c.status === 'sent' || c.status === 'completed').length
        const successRate = campaignsSent > 0 ? (successfulCampaigns / campaignsSent) * 100 : 0

        setStats({
          totalCustomers,
          activeSegments,
          campaignsSent,
          successRate: Math.round(successRate * 10) / 10 // Round to 1 decimal place
        })

        // Generate recent activities (you can customize this based on your data structure)
        const recentActivities: ActivityItem[] = []
        
        // Add recent customers
        customers.slice(0, 2).forEach((customer: any, index: number) => {
          recentActivities.push({
            id: `customer-${index}`,
            type: 'customer',
            message: `New customer added: ${customer.name || customer.email || 'Unknown'}`,
            timestamp: customer.createdAt || new Date().toISOString()
          })
        })

        // Add recent campaigns
        campaigns.slice(0, 2).forEach((campaign: any, index: number) => {
          recentActivities.push({
            id: `campaign-${index}`,
            type: 'campaign',
            message: `Campaign "${campaign.name || 'Untitled'}" ${campaign.status || 'created'}`,
            timestamp: campaign.createdAt || new Date().toISOString()
          })
        })

        // Add recent segments
        segments.slice(0, 1).forEach((segment: any, index: number) => {
          recentActivities.push({
            id: `segment-${index}`,
            type: 'segment',
            message: `New segment "${segment.name || 'Untitled'}" created`,
            timestamp: segment.createdAt || new Date().toISOString()
          })
        })

        // Sort activities by timestamp (most recent first)
        recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setActivities(recentActivities.slice(0, 5)) // Show only 5 most recent

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
        
        // Fallback to mock data if API fails
        setStats({
          totalCustomers: 0,
          activeSegments: 0,
          campaignsSent: 0,
          successRate: 0
        })
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-blue-500'
      case 'campaign': return 'bg-green-500'
      case 'segment': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    return `${days} days ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    )
  }

  const dashboardStats = [
    {
      name: "Total Customers",
      value: stats?.totalCustomers.toString() || "0",
      change: "+12%", // You can calculate this based on historical data
      changeType: "positive",
      icon: Users,
    },
    {
      name: "Active Segments",
      value: stats?.activeSegments.toString() || "0",
      change: "+2",
      changeType: "positive",
      icon: Target,
    },
    {
      name: "Campaigns Sent",
      value: stats?.campaignsSent.toString() || "0",
      change: "+8",
      changeType: "positive",
      icon: Send,
    },
    {
      name: "Success Rate",
      value: `${stats?.successRate || 0}%`,
      change: "+2.1%",
      changeType: "positive",
      icon: TrendingUp,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your Mini CRM dashboard. Here's what's happening with your customers and campaigns.
        </p>
        {error && (
          <div className="mt-2 flex items-center text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{item.name}</CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <p className="text-xs text-green-600 mt-1">{item.change} from last month</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest customer and campaign activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${getActivityIcon(activity.type)}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Start by adding customers or creating campaigns</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/customers'}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-sm">Add New Customer</div>
                <div className="text-xs text-gray-500">Quickly add a customer to your database</div>
              </button>
              <button 
                onClick={() => window.location.href = '/segments'}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-sm">Create Audience Segment</div>
                <div className="text-xs text-gray-500">Define rules to segment your customers</div>
              </button>
              <button 
                onClick={() => window.location.href = '/campaigns'}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-sm">Launch Campaign</div>
                <div className="text-xs text-gray-500">Send targeted messages to your segments</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}