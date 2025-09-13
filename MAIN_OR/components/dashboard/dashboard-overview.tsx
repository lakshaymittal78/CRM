"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, Send, TrendingUp } from "lucide-react"

export function DashboardOverview() {
  // TODO: Replace with real data from API
  const stats = [
    {
      name: "Total Customers",
      value: "1,234",
      change: "+12%",
      changeType: "positive",
      icon: Users,
    },
    {
      name: "Active Segments",
      value: "8",
      change: "+2",
      changeType: "positive",
      icon: Target,
    },
    {
      name: "Campaigns Sent",
      value: "45",
      change: "+8",
      changeType: "positive",
      icon: Send,
    },
    {
      name: "Success Rate",
      value: "89.2%",
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
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
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
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New customer added: John Doe</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Campaign "Summer Sale" sent successfully</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New segment "High Value Customers" created</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
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
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Add New Customer</div>
                <div className="text-xs text-gray-500">Quickly add a customer to your database</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Create Audience Segment</div>
                <div className="text-xs text-gray-500">Define rules to segment your customers</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
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
