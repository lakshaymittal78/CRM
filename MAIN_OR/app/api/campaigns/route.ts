import { type NextRequest, NextResponse } from "next/server"

// Mock database - replace with MongoDB in production
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
  {
    id: "2",
    name: "Win-back Campaign",
    message: "We miss you! Come back and get 15% OFF your next purchase. Use code COMEBACK15.",
    segmentId: "2",
    segmentName: "Inactive Customers",
    sentCount: 89,
    failedCount: 12,
    status: "completed",
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
  },
]

const campaignLogs: any[] = []

export async function GET() {
  try {
    return NextResponse.json({ campaigns })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, message, segmentId } = await request.json()

    if (!name || !message || !segmentId) {
      return NextResponse.json({ error: "Name, message, and segment ID are required" }, { status: 400 })
    }

    // Get segment info from segments API
    const segmentsResponse = await fetch(`${request.nextUrl.origin}/api/segments`)
    const segmentsData = await segmentsResponse.json()
    const segment = segmentsData.segments?.find((s: any) => s.id === segmentId)

    if (!segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 })
    }

    const newCampaign = {
      id: Date.now().toString(),
      name,
      message,
      segmentId,
      segmentName: segment.name,
      sentCount: 0,
      failedCount: 0,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    campaigns.push(newCampaign)

    return NextResponse.json({ campaign: newCampaign }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}
