export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalSpend: number
  lastPurchaseDate: string | null
  location: string // Added location field for segment filtering
  createdAt: string
  updatedAt: string
}

export interface CustomerFormData {
  name: string
  email: string
  phone: string
  totalSpend: string
  lastPurchaseDate: string
  location: string // Added location field to form data
}

export interface Segment {
  id: string
  name: string
  ruleText: string
  parsedRule: Record<string, any>
  customerCount: number
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  name: string
  message: string
  segmentId: string
  segmentName: string
  sentCount: number
  failedCount: number
  status: "draft" | "sending" | "completed" | "failed"
  createdAt: string
  updatedAt: string
}

export interface CampaignLog {
  id: string
  campaignId: string
  customerId: string
  status: "sent" | "failed"
  timestamp: string
  errorMessage?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}
