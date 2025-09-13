import { type NextRequest, NextResponse } from "next/server"

// Mock database - replace with MongoDB in production
const segments: any[] = [
  {
    id: "1",
    name: "High Value Customers",
    ruleText: "spend > ₹10,000",
    parsedRule: { field: "totalSpend", operator: ">", value: 10000 },
    customerCount: 45,
    createdAt: "2024-01-10T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Inactive Customers",
    ruleText: "last_purchase_date older than 3 months",
    parsedRule: { field: "lastPurchaseDate", operator: "<", value: "2023-10-01" },
    customerCount: 123,
    createdAt: "2024-01-08T00:00:00.000Z",
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const segment = segments.find((s) => s.id === params.id)

    if (!segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 })
    }

    return NextResponse.json({ segment })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch segment" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, ruleText } = await request.json()
    const segmentIndex = segments.findIndex((s) => s.id === params.id)

    if (segmentIndex === -1) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 })
    }

    // Re-parse rule with AI if ruleText changed
    const parsedRule = await simulateAIParsing(ruleText)
    const customerCount = Math.floor(Math.random() * 200) + 10

    segments[segmentIndex] = {
      ...segments[segmentIndex],
      name,
      ruleText,
      parsedRule,
      customerCount,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ segment: segments[segmentIndex] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update segment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const segmentIndex = segments.findIndex((s) => s.id === params.id)

    if (segmentIndex === -1) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 })
    }

    segments.splice(segmentIndex, 1)
    return NextResponse.json({ message: "Segment deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete segment" }, { status: 500 })
  }
}

// Simulated AI parsing function (same as in route.ts)
async function simulateAIParsing(ruleText: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const lowerRule = ruleText.toLowerCase()

  if (lowerRule.includes("spend") && lowerRule.includes(">")) {
    const match = ruleText.match(/₹?([\d,]+)/)
    const value = match ? Number.parseInt(match[1].replace(",", "")) : 10000
    return { field: "totalSpend", operator: ">", value }
  }

  if (lowerRule.includes("spend") && lowerRule.includes("<")) {
    const match = ruleText.match(/₹?([\d,]+)/)
    const value = match ? Number.parseInt(match[1].replace(",", "")) : 5000
    return { field: "totalSpend", operator: "<", value }
  }

  if (lowerRule.includes("last purchase") || lowerRule.includes("inactive")) {
    return {
      field: "lastPurchaseDate",
      operator: "<",
      value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }
  }

  if (lowerRule.includes("location") || lowerRule.includes("city")) {
    const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"]
    const city = cities.find((c) => lowerRule.includes(c.toLowerCase())) || "Mumbai"
    return { field: "location", operator: "=", value: city }
  }

  return { field: "totalSpend", operator: ">", value: 0 }
}
