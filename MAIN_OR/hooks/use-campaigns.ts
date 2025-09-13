"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import type { Campaign } from "@/lib/types"

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getCampaigns()
      setCampaigns(response.campaigns || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch campaigns")
    } finally {
      setLoading(false)
    }
  }

  const createCampaign = async (campaignData: { name: string; message: string; segmentId: string }) => {
    try {
      setError(null)
      const response = await apiClient.createCampaign(campaignData)
      setCampaigns((prev) => [response.campaign, ...prev])
      return response.campaign
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create campaign"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const sendCampaign = async (campaignId: string) => {
    try {
      setError(null)

      // Update campaign status to sending immediately
      setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? { ...c, status: "sending" as const } : c)))

      const response = await apiClient.sendCampaign(campaignId)

      // Update with final results
      setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? response.campaign : c)))

      return response
    } catch (err) {
      // Revert status on error
      setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? { ...c, status: "failed" as const } : c)))

      const errorMessage = err instanceof Error ? err.message : "Failed to send campaign"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return {
    campaigns,
    loading,
    error,
    createCampaign,
    sendCampaign,
    refetch: fetchCampaigns,
  }
}
