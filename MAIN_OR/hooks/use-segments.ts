"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import type { Segment } from "@/lib/types"

export function useSegments() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSegments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getSegments()
      setSegments(response.segments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch segments")
    } finally {
      setLoading(false)
    }
  }

  const createSegment = async (segmentData: { name: string; ruleText: string }) => {
    try {
      setError(null)
      const response = await apiClient.createSegment(segmentData)
      setSegments((prev) => [...prev, response.segment])
      return response.segment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create segment"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateSegment = async (id: string, segmentData: { name: string; ruleText: string }) => {
    try {
      setError(null)
      const response = await apiClient.updateSegment(id, segmentData)
      setSegments((prev) => prev.map((s) => (s.id === id ? response.segment : s)))
      return response.segment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update segment"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteSegment = async (id: string) => {
    try {
      setError(null)
      await apiClient.deleteSegment(id)
      setSegments((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete segment"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchSegments()
  }, [])

  return {
    segments,
    loading,
    error,
    createSegment,
    updateSegment,
    deleteSegment,
    refetch: fetchSegments,
  }
}
