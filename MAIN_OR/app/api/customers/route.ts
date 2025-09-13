import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Authentication required")
  }
  return session
}

// TODO: Replace with actual MongoDB connection
// For now, using in-memory storage to simulate database
const customers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+91-9876543210",
    totalSpend: 15000,
    lastPurchaseDate: "2024-01-15",
    location: "Mumbai",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91-9876543211",
    totalSpend: 8500,
    lastPurchaseDate: "2023-11-20",
    location: "Delhi",
    createdAt: "2023-10-01",
    updatedAt: "2023-11-20",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+91-9876543212",
    totalSpend: 25000,
    lastPurchaseDate: "2024-01-10",
    location: "Bangalore",
    createdAt: "2023-12-01",
    updatedAt: "2024-01-10",
  },
]

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let filteredCustomers = customers

    // Apply search filter
    if (search) {
      filteredCustomers = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(search.toLowerCase()) ||
          customer.email.toLowerCase().includes(search.toLowerCase()) ||
          customer.phone.includes(search),
      )
    }

    // Apply pagination
    const paginatedCustomers = filteredCustomers.slice(offset, offset + limit)

    return NextResponse.json({
      customers: paginatedCustomers,
      total: filteredCustomers.length,
      limit,
      offset,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const { name, email, phone, totalSpend, lastPurchaseDate, location } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 })
    }

    // Check for duplicate email
    const existingCustomer = customers.find((c) => c.email === email)
    if (existingCustomer) {
      return NextResponse.json({ error: "Customer with this email already exists" }, { status: 409 })
    }

    // Create new customer
    const newCustomer = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      totalSpend: Number.parseFloat(totalSpend) || 0,
      lastPurchaseDate: lastPurchaseDate || null,
      location: location || "Mumbai",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    customers.push(newCustomer)

    return NextResponse.json(newCustomer, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
