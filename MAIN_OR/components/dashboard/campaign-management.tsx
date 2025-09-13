"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Send, Clock, CheckCircle, XCircle, Users, AlertCircle, Eye } from "lucide-react"
import { useCampaigns } from "@/hooks/use-campaigns"
import { useSegments } from "@/hooks/use-segments"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CampaignLogsViewer } from "./campaign-logs-viewer"

export function CampaignManagement() {
  const { campaigns, loading, error, createCampaign, sendCampaign } = useCampaigns()
  const { segments } = useSegments()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCampaignForLogs, setSelectedCampaignForLogs] = useState<string | null>(null)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    message: "",
    segmentId: "",
  })
  const [sendingCampaigns, setSendingCampaigns] = useState<Set<string>>(new Set())

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCampaign(newCampaign)
      setNewCampaign({ name: "", message: "", segmentId: "" })
      setShowCreateForm(false)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleSendCampaign = async (campaignId: string) => {
    setSendingCampaigns((prev) => new Set(prev).add(campaignId))
    try {
      await sendCampaign(campaignId)
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setSendingCampaigns((prev) => {
        const newSet = new Set(prev)
        newSet.delete(campaignId)
        return newSet
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "sending":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "failed":
        return "Failed"
      case "sending":
        return "Sending..."
      case "draft":
        return "Draft"
      default:
        return "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and send targeted campaigns to your customer segments.</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
            <CardDescription>Design your campaign message and select the target audience segment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g., Summer Sale Campaign"
                  required
                />
              </div>

              <div>
                <Label htmlFor="campaignMessage">Campaign Message</Label>
                <Textarea
                  id="campaignMessage"
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                  placeholder="e.g., Get 10% OFF your next order! Use code SAVE10."
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Keep it concise and include a clear call-to-action.</p>
              </div>

              <div>
                <Label htmlFor="segment">Target Segment</Label>
                <Select
                  value={newCampaign.segmentId}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, segmentId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name} ({segment.customerCount} customers)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Campaign</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
          <CardDescription>View all your campaigns and their performance metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">Create your first campaign to start engaging with your customers.</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(campaign.status)}
                        <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {getStatusText(campaign.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{campaign.message}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        Target: {campaign.segmentName}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-500">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-1">
                        {campaign.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => handleSendCampaign(campaign.id)}
                            disabled={sendingCampaigns.has(campaign.id)}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            {sendingCampaigns.has(campaign.id) ? "Sending..." : "Send"}
                          </Button>
                        )}
                        {(campaign.status === "completed" || campaign.status === "failed") && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-3 h-3 mr-1" />
                                View Logs
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Campaign Delivery Logs</DialogTitle>
                                <DialogDescription>Detailed delivery logs for "{campaign.name}"</DialogDescription>
                              </DialogHeader>
                              <CampaignLogsViewer campaignId={campaign.id} showFilters={true} />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>

                  {(campaign.status === "completed" || campaign.status === "failed") && (
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {campaign.sentCount} sent
                      </div>
                      <div className="flex items-center text-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        {campaign.failedCount} failed
                      </div>
                      <div className="text-gray-600">
                        Success rate:{" "}
                        {campaign.sentCount + campaign.failedCount > 0
                          ? ((campaign.sentCount / (campaign.sentCount + campaign.failedCount)) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CampaignLogsViewer showFilters={true} />
    </div>
  )
}
