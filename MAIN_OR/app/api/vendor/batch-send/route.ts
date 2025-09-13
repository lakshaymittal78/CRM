import { type NextRequest, NextResponse } from "next/server"

interface BatchSendRequest {
  apiKey: string
  messages: Array<{
    to: string
    message: string
    customerData?: {
      id: string
      name: string
      email: string
    }
  }>
  campaignId?: string
}

interface BatchSendResponse {
  success: boolean
  totalMessages: number
  successCount: number
  failureCount: number
  results: Array<{
    to: string
    success: boolean
    messageId?: string
    error?: string
    errorCode?: string
    deliveryStatus: "sent" | "failed"
    timestamp: string
  }>
  campaignId?: string
}

const VENDOR_CONFIG = {
  apiKey: "dummy_vendor_api_key_12345",
  maxBatchSize: 1000,
  successRate: 0.9,
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchSendRequest = await request.json()

    // Validate API key
    if (!body.apiKey || body.apiKey !== VENDOR_CONFIG.apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid API key",
          totalMessages: 0,
          successCount: 0,
          failureCount: 0,
          results: [],
        },
        { status: 401 },
      )
    }

    // Validate batch size
    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No messages provided",
          totalMessages: 0,
          successCount: 0,
          failureCount: 0,
          results: [],
        },
        { status: 400 },
      )
    }

    if (body.messages.length > VENDOR_CONFIG.maxBatchSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Batch size exceeds maximum of ${VENDOR_CONFIG.maxBatchSize} messages`,
          totalMessages: body.messages.length,
          successCount: 0,
          failureCount: body.messages.length,
          results: [],
        },
        { status: 400 },
      )
    }

    // Simulate batch processing delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000))

    const results = []
    let successCount = 0
    let failureCount = 0

    // Process each message
    for (const message of body.messages) {
      const isSuccess = Math.random() < VENDOR_CONFIG.successRate

      if (isSuccess) {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        results.push({
          to: message.to,
          success: true,
          messageId,
          deliveryStatus: "sent" as const,
          timestamp: new Date().toISOString(),
        })
        successCount++
      } else {
        const errorScenarios = [
          { error: "Invalid phone number format", errorCode: "INVALID_PHONE" },
          { error: "Customer opted out", errorCode: "OPTED_OUT" },
          { error: "Network timeout", errorCode: "NETWORK_TIMEOUT" },
          { error: "Carrier rejected", errorCode: "CARRIER_REJECTED" },
          { error: "Content blocked", errorCode: "CONTENT_BLOCKED" },
        ]

        const errorScenario = errorScenarios[Math.floor(Math.random() * errorScenarios.length)]

        results.push({
          to: message.to,
          success: false,
          error: errorScenario.error,
          errorCode: errorScenario.errorCode,
          deliveryStatus: "failed" as const,
          timestamp: new Date().toISOString(),
        })
        failureCount++
      }

      // Small delay between messages to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    const response: BatchSendResponse = {
      success: true,
      totalMessages: body.messages.length,
      successCount,
      failureCount,
      results,
      campaignId: body.campaignId,
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        totalMessages: 0,
        successCount: 0,
        failureCount: 0,
        results: [],
      },
      { status: 500 },
    )
  }
}
