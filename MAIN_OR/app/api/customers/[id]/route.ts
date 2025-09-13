import { type NextRequest, NextResponse } from "next/server"

// TODO: Replace with actual MongoDB connection
// Using the same in-memory storage as the main route
const customers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+91-9876543210",
    totalSpend: 15000,
    lastPurchaseDate: "2024-01-15",
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
    createdAt: "2023-12-01",
    updatedAt: "2024-01-10",
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customer = customers.find((c) => c.id === params.id)

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, email, phone, totalSpend, lastPurchaseDate } = body

    const customerIndex = customers.findIndex((c) => c.id === params.id)

    if (customerIndex === -1) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Check for duplicate email (excluding current customer)
    const existingCustomer = customers.find((c) => c.email === email && c.id !== params.id)
    if (existingCustomer) {
      return NextResponse.json({ error: "Customer with this email already exists" }, { status: 409 })
    }

    // Update customer
    customers[customerIndex] = {
      ...customers[customerIndex],
      name: name || customers[customerIndex].name,
      email: email || customers[customerIndex].email,
      phone: phone || customers[customerIndex].phone,
      totalSpend: totalSpend !== undefined ? Number.parseFloat(totalSpend) : customers[customerIndex].totalSpend,
      lastPurchaseDate: lastPurchaseDate || customers[customerIndex].lastPurchaseDate,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(customers[customerIndex])
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerIndex = customers.findIndex((c) => c.id === params.id)

    if (customerIndex === -1) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Remove customer
    const deletedCustomer = customers.splice(customerIndex, 1)[0]

    return NextResponse.json({
      message: "Customer deleted successfully",
      customer: deletedCustomer,
    })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
