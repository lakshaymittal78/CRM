import { type NextRequest, NextResponse } from "next/server"
import { vendorApiClient, type VendorMessage } from "@/lib/vendor-api"

// Mock database references
const campaigns: any[] = [
  {
    id: "1",
    name: "Summer Sale Campaign",
    message: "Get 20% OFF on all summer collection! Use code SUMMER20. Valid till July 31st.",
    segmentId: "1",
    segmentName: "High Value Customers",
    sentCount: 45,
    failedCount: 3,
    status: "completed",
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  },
]

import { campaignLogs } from "../../logs/route"

// Mock customers data
const mockCustomers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+91-9876543210",
    totalSpend: 15000,
    lastPurchaseDate: "2024-01-10",
    location: "Mumbai",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91-9876543211",
    totalSpend: 8000,
    lastPurchaseDate: "2023-12-15",
    location: "Delhi",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+91-9876543212",
    totalSpend: 12000,
    lastPurchaseDate: "2024-01-05",
    location: "Bangalore",
  },
]

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id
    const campaignIndex = campaigns.findIndex((c) => c.id === campaignId)

    if (campaignIndex === -1) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const campaign = campaigns[campaignIndex]

    if (campaign.status === "sending") {
      return NextResponse.json({ error: "Campaign is already being sent" }, { status: 400 })
    }

    // Update campaign status to sending
    campaigns[campaignIndex] = {
      ...campaign,
      status: "sending",
      updatedAt: new Date().toISOString(),
    }

    // Get segment info to find target customers
    const segmentsResponse = await fetch(`${request.nextUrl.origin}/api/segments`)
    const segmentsData = await segmentsResponse.json()
    const segment = segmentsData.segments?.find((s: any) => s.id === campaign.segmentId)

    if (!segment) {
      campaigns[campaignIndex].status = "failed"
      return NextResponse.json({ error: "Target segment not found" }, { status: 404 })
    }

    // Filter customers based on segment rules
    const targetCustomers = filterCustomersBySegment(mockCustomers, segment.parsedRule)

    // Prepare messages for vendor API
    const vendorMessages: VendorMessage[] = targetCustomers.map((customer) => ({
      to: customer.phone,
      message: campaign.message,
      customerData: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    }))

    // Send campaign through vendor API
    const deliveryResults = await vendorApiClient.sendBatchMessages(vendorMessages, campaignId)

    // Update campaign with results
    const sentCount = deliveryResults.filter((r) => r.success).length
    const failedCount = deliveryResults.filter((r) => !r.success).length

    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      sentCount,
      failedCount,
      status: "completed",
      updatedAt: new Date().toISOString(),
    }

    const logs = deliveryResults.map((result) => {
      const customer = targetCustomers.find((c) => c.phone === result.to)
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        campaignId,
        customerId: customer?.id || "unknown",
        customerName: customer?.name || "Unknown",
        customerEmail: customer?.email || "Unknown",
        customerPhone: result.to,
        status: result.success ? "sent" : "failed",
        timestamp: result.timestamp,
        errorMessage: result.error,
        deliveryAttempts: result.retryCount || 1,
        vendorMessageId: result.messageId,
        vendorErrorCode: result.errorCode,
      }
    })

    campaignLogs.push(...logs)

    return NextResponse.json({
      campaign: campaigns[campaignIndex],
      deliveryResults: {
        sent: sentCount,
        failed: failedCount,
        total: targetCustomers.length,
      },
      vendorApiUsed: true,
    })
  } catch (error) {
    // Update campaign status to failed
    const campaignIndex = campaigns.findIndex((c) => c.id === params.id)
    if (campaignIndex !== -1) {
      campaigns[campaignIndex].status = "failed"
    }

    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 })
  }
}

// Filter customers based on segment rules
function filterCustomersBySegment(customers: any[], parsedRule: any) {
  if (!parsedRule || !parsedRule.field) {
    return customers
  }

  return customers.filter((customer) => {
    const { field, operator, value } = parsedRule

    switch (field) {
      case "totalSpend":
        if (operator === ">") return customer.totalSpend > value
        if (operator === "<") return customer.totalSpend < value
        if (operator === "=") return customer.totalSpend === value
        break

      case "lastPurchaseDate":
        const customerDate = new Date(customer.lastPurchaseDate)
        const ruleDate = new Date(value)
        if (operator === "<") return customerDate < ruleDate
        if (operator === ">") return customerDate > ruleDate
        break

      case "location":
        if (operator === "=") return customer.location === value
        break
    }

    return true
  })
}
