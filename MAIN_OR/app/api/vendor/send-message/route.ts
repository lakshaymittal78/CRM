import { type NextRequest, NextResponse } from "next/server"

// Simulate vendor API configuration
const VENDOR_CONFIG = {
  apiKey: "dummy_vendor_api_key_12345",
  rateLimitPerMinute: 100,
  maxRetries: 3,
  successRate: 0.9, // 90% success rate
}

// Track API usage for rate limiting simulation
const apiUsage = {
  requestCount: 0,
  lastResetTime: Date.now(),
}

interface SendMessageRequest {
  apiKey: string
  to: string
  message: string
  customerData?: {
    id: string
    name: string
    email: string
  }
}

interface SendMessageResponse {
  success: boolean
  messageId?: string
  error?: string
  errorCode?: string
  deliveryStatus: "sent" | "failed" | "pending"
  timestamp: string
  retryCount?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json()

    // Validate API key
    if (!body.apiKey || body.apiKey !== VENDOR_CONFIG.apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid API key",
          errorCode: "AUTH_FAILED",
          deliveryStatus: "failed",
          timestamp: new Date().toISOString(),
        } as SendMessageResponse,
        { status: 401 },
      )
    }

    // Validate required fields
    if (!body.to || !body.message) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: 'to' and 'message'",
          errorCode: "INVALID_REQUEST",
          deliveryStatus: "failed",
          timestamp: new Date().toISOString(),
        } as SendMessageResponse,
        { status: 400 },
      )
    }

    // Simulate rate limiting
    const now = Date.now()
    if (now - apiUsage.lastResetTime > 60000) {
      // Reset every minute
      apiUsage.requestCount = 0
      apiUsage.lastResetTime = now
    }

    apiUsage.requestCount++
    if (apiUsage.requestCount > VENDOR_CONFIG.rateLimitPerMinute) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Try again later.",
          errorCode: "RATE_LIMIT_EXCEEDED",
          deliveryStatus: "failed",
          timestamp: new Date().toISOString(),
        } as SendMessageResponse,
        { status: 429 },
      )
    }

    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

    // Simulate various failure scenarios
    const random = Math.random()
    const isSuccess = random < VENDOR_CONFIG.successRate

    if (!isSuccess) {
      const errorScenarios = [
        {
          error: "Invalid phone number format",
          errorCode: "INVALID_PHONE",
          shouldRetry: false,
        },
        {
          error: "Customer has opted out of marketing messages",
          errorCode: "OPTED_OUT",
          shouldRetry: false,
        },
        {
          error: "Network timeout - please retry",
          errorCode: "NETWORK_TIMEOUT",
          shouldRetry: true,
        },
        {
          error: "Carrier rejected the message",
          errorCode: "CARRIER_REJECTED",
          shouldRetry: false,
        },
        {
          error: "Daily sending limit exceeded for this number",
          errorCode: "DAILY_LIMIT_EXCEEDED",
          shouldRetry: true,
        },
        {
          error: "Message content blocked by spam filter",
          errorCode: "CONTENT_BLOCKED",
          shouldRetry: false,
        },
      ]

      const errorScenario = errorScenarios[Math.floor(Math.random() * errorScenarios.length)]

      return NextResponse.json(
        {
          success: false,
          error: errorScenario.error,
          errorCode: errorScenario.errorCode,
          deliveryStatus: "failed",
          timestamp: new Date().toISOString(),
          retryCount: 0,
        } as SendMessageResponse,
        { status: 400 },
      )
    }

    // Success case
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      messageId,
      deliveryStatus: "sent",
      timestamp: new Date().toISOString(),
    } as SendMessageResponse)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        errorCode: "INTERNAL_ERROR",
        deliveryStatus: "failed",
        timestamp: new Date().toISOString(),
      } as SendMessageResponse,
      { status: 500 },
    )
  }
}

// Health check endpoint for the vendor API
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "Dummy Vendor Messaging API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    rateLimits: {
      requestsPerMinute: VENDOR_CONFIG.rateLimitPerMinute,
      currentUsage: apiUsage.requestCount,
    },
  })
}
