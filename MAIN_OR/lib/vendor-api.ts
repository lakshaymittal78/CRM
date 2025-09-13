// Vendor API client for communicating with the dummy messaging service

const VENDOR_API_BASE = process.env.NEXT_PUBLIC_API_URL || ""
const VENDOR_API_KEY = "dummy_vendor_api_key_12345"

export interface VendorMessage {
  to: string
  message: string
  customerData?: {
    id: string
    name: string
    email: string
  }
}

export interface VendorSendResult {
  to: string
  success: boolean
  messageId?: string
  error?: string
  errorCode?: string
  deliveryStatus: "sent" | "failed"
  timestamp: string
  retryCount?: number
}

export class VendorApiClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string = VENDOR_API_KEY, baseUrl: string = VENDOR_API_BASE) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async sendSingleMessage(message: VendorMessage): Promise<VendorSendResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vendor/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          ...message,
        }),
      })

      const result = await response.json()

      return {
        to: message.to,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        errorCode: result.errorCode,
        deliveryStatus: result.deliveryStatus,
        timestamp: result.timestamp,
        retryCount: result.retryCount,
      }
    } catch (error) {
      return {
        to: message.to,
        success: false,
        error: "Network error - failed to reach vendor API",
        errorCode: "NETWORK_ERROR",
        deliveryStatus: "failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async sendBatchMessages(messages: VendorMessage[], campaignId?: string): Promise<VendorSendResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vendor/batch-send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          messages,
          campaignId,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        // If batch failed entirely, return failure for all messages
        return messages.map((msg) => ({
          to: msg.to,
          success: false,
          error: result.error || "Batch send failed",
          errorCode: "BATCH_FAILED",
          deliveryStatus: "failed" as const,
          timestamp: new Date().toISOString(),
        }))
      }

      return result.results
    } catch (error) {
      // Network error - return failure for all messages
      return messages.map((msg) => ({
        to: msg.to,
        success: false,
        error: "Network error - failed to reach vendor API",
        errorCode: "NETWORK_ERROR",
        deliveryStatus: "failed" as const,
        timestamp: new Date().toISOString(),
      }))
    }
  }

  async checkHealth(): Promise<{ status: string; healthy: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vendor/send-message`, {
        method: "GET",
      })

      const result = await response.json()
      return {
        status: result.status,
        healthy: response.ok && result.status === "healthy",
      }
    } catch (error) {
      return {
        status: "unreachable",
        healthy: false,
      }
    }
  }
}

export const vendorApiClient = new VendorApiClient()
