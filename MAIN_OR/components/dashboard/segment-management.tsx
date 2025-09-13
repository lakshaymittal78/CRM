"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Target, Users, Sparkles, Trash2, Edit, Eye, AlertCircle } from "lucide-react"
import { useSegments } from "@/hooks/use-segments"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SegmentManagement() {
  const { segments, loading, error, createSegment, updateSegment, deleteSegment } = useSegments()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSegment, setEditingSegment] = useState<any>(null)
  const [newSegment, setNewSegment] = useState({
    name: "",
    ruleText: "",
  })
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [aiParseResult, setAiParseResult] = useState<string | null>(null)

  const handleAddSegment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSegment(newSegment)
      setNewSegment({ name: "", ruleText: "" })
      setShowAddForm(false)
      setAiParseResult(null)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleEditSegment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSegment) return

    try {
      await updateSegment(editingSegment.id, newSegment)
      setEditingSegment(null)
      setNewSegment({ name: "", ruleText: "" })
      setAiParseResult(null)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleAIParseRule = async () => {
    if (!newSegment.ruleText.trim()) return

    setIsProcessingAI(true)
    setAiParseResult(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock AI response with parsed rule preview
      const lowerRule = newSegment.ruleText.toLowerCase()
      let parseResult = ""

      if (lowerRule.includes("spend") && lowerRule.includes(">")) {
        const match = newSegment.ruleText.match(/₹?([\d,]+)/)
        const value = match ? match[1] : "10,000"
        parseResult = `✅ Parsed: Customers with total spend > ₹${value}`
      } else if (lowerRule.includes("spend") && lowerRule.includes("<")) {
        const match = newSegment.ruleText.match(/₹?([\d,]+)/)
        const value = match ? match[1] : "5,000"
        parseResult = `✅ Parsed: Customers with total spend < ₹${value}`
      } else if (lowerRule.includes("last purchase") || lowerRule.includes("inactive")) {
        parseResult = `✅ Parsed: Customers with last purchase older than 3 months`
      } else if (lowerRule.includes("location") || lowerRule.includes("city")) {
        const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"]
        const city = cities.find((c) => lowerRule.includes(c.toLowerCase())) || "Mumbai"
        parseResult = `✅ Parsed: Customers from ${city}`
      } else {
        parseResult = `✅ Parsed: Custom rule - will be processed during segment creation`
      }

      setAiParseResult(parseResult)
    } catch (error) {
      setAiParseResult("❌ AI parsing failed. Please try again.")
    } finally {
      setIsProcessingAI(false)
    }
  }

  const startEdit = (segment: any) => {
    setEditingSegment(segment)
    setNewSegment({ name: segment.name, ruleText: segment.ruleText })
    setShowAddForm(true)
  }

  const cancelEdit = () => {
    setEditingSegment(null)
    setNewSegment({ name: "", ruleText: "" })
    setShowAddForm(false)
    setAiParseResult(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading segments...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audience Segments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage customer segments using flexible rules and AI-powered parsing.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="w-4 h-4 mr-2" />
          Create Segment
        </Button>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingSegment ? "Edit Segment" : "Create New Segment"}</CardTitle>
            <CardDescription>
              Define rules to automatically segment your customers. Use natural language and let AI parse it for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingSegment ? handleEditSegment : handleAddSegment} className="space-y-4">
              <div>
                <Label htmlFor="segmentName">Segment Name</Label>
                <Input
                  id="segmentName"
                  value={newSegment.name}
                  onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                  placeholder="e.g., High Value Customers"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ruleText">Segment Rules</Label>
                <div className="space-y-2">
                  <Textarea
                    id="ruleText"
                    value={newSegment.ruleText}
                    onChange={(e) => setNewSegment({ ...newSegment, ruleText: e.target.value })}
                    placeholder="e.g., Customers who spent more than ₹10,000 and haven't purchased in the last 2 months"
                    rows={3}
                    required
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAIParseRule}
                      disabled={isProcessingAI || !newSegment.ruleText.trim()}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isProcessingAI ? "Processing with AI..." : "Parse with AI"}
                    </Button>
                  </div>
                  {aiParseResult && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">{aiParseResult}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Examples: "spend {">"} ₹10,000", "last purchase older than 3 months", "customers from Mumbai who spent
                  less than ₹5,000"
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingSegment ? "Update Segment" : "Create Segment"}</Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">{new Date(segment.createdAt).toLocaleDateString()}</span>
              </div>
              <CardTitle className="text-lg">{segment.name}</CardTitle>
              <CardDescription>{segment.ruleText}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {segment.customerCount} customers
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => startEdit(segment)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSegment(segment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {segments.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No segments yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first audience segment to start targeting specific customer groups.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Segment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
