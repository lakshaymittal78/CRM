import { type NextRequest, NextResponse } from "next/server"

// Mock campaign logs storage - replace with MongoDB in production
const campaignLogs: any[] = [
  {
    id: "log1",
    campaignId: "1",
    customerId: "1",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+91-9876543210",
    status: "sent",
    timestamp: "2024-01-15T10:30:00.000Z",
    errorMessage: null,
    deliveryAttempts: 1,
  },
  {
    id: "log2",
    campaignId: "1",
    customerId: "2",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    customerPhone: "+91-9876543211",
    status: "failed",
    timestamp: "2024-01-15T10:30:05.000Z",
    errorMessage: "Invalid phone number format",
    deliveryAttempts: 3,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaignId")
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let filteredLogs = [...campaignLogs]

    // Filter by campaign ID
    if (campaignId) {
      filteredLogs = filteredLogs.filter((log) => log.campaignId === campaignId)
    }

    // Filter by status
    if (status && status !== "all") {
      filteredLogs = filteredLogs.filter((log) => log.status === status)
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply pagination
    const total = filteredLogs.length
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch campaign logs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const logData = await request.json()

    const newLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      deliveryAttempts: 1,
      ...logData,
    }

    campaignLogs.push(newLog)

    return NextResponse.json({ log: newLog }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create campaign log" }, { status: 500 })
  }
}

// Export logs for use in other API routes
export { campaignLogs }
