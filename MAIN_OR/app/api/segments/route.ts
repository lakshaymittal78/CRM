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

export async function GET() {
  try {
    return NextResponse.json({ segments })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch segments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, ruleText } = await request.json()

    if (!name || !ruleText) {
      return NextResponse.json({ error: "Name and rule text are required" }, { status: 400 })
    }

    // Simulate AI parsing with Groq (mock implementation)
    const parsedRule = await simulateAIParsing(ruleText)

    const customersResponse = await fetch(`${request.nextUrl.origin}/api/customers`)
    const customersData = await customersResponse.json()
    const customers = customersData.customers || []

    // Filter customers using the same logic as campaign sending
    const matchingCustomers = filterCustomersBySegment(customers, parsedRule)
    const customerCount = matchingCustomers.length

    const newSegment = {
      id: Date.now().toString(),
      name,
      ruleText,
      parsedRule,
      customerCount, // Now uses real customer count
      createdAt: new Date().toISOString(),
    }

    segments.push(newSegment)

    return NextResponse.json({ segment: newSegment }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create segment" }, { status: 500 })
  }
}

// Simulated AI parsing function (replace with actual Groq API call)
async function simulateAIParsing(ruleText: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simple rule parsing logic (mock AI behavior)
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

  // Default fallback
  return { field: "totalSpend", operator: ">", value: 0 }
}

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
