// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // TODO: Add authentication token to headers
    // const token = await getAuthToken()
    // if (token) {
    //   config.headers = {
    //     ...config.headers,
    //     Authorization: `Bearer ${token}`,
    //   }
    // }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getCustomers(params?: { search?: string; limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append("search", params.search)
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.offset) searchParams.append("offset", params.offset.toString())

    const query = searchParams.toString()
    return this.request(`/api/customers${query ? `?${query}` : ""}`)
  }

  async getCustomer(id: string) {
    return this.request(`/api/customers/${id}`)
  }

  async createCustomer(customer: any) {
    return this.request("/api/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    })
  }

  async updateCustomer(id: string, customer: any) {
    return this.request(`/api/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    })
  }

  async deleteCustomer(id: string) {
    return this.request(`/api/customers/${id}`, {
      method: "DELETE",
    })
  }

  // Segment API methods
  async getSegments() {
    return this.request("/api/segments")
  }

  async getSegment(id: string) {
    return this.request(`/api/segments/${id}`)
  }

  async createSegment(segment: any) {
    return this.request("/api/segments", {
      method: "POST",
      body: JSON.stringify(segment),
    })
  }

  async updateSegment(id: string, segment: any) {
    return this.request(`/api/segments/${id}`, {
      method: "PUT",
      body: JSON.stringify(segment),
    })
  }

  async deleteSegment(id: string) {
    return this.request(`/api/segments/${id}`, {
      method: "DELETE",
    })
  }

  // Campaign API methods
  async getCampaigns() {
    return this.request("/api/campaigns")
  }

  async createCampaign(campaign: any) {
    return this.request("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(campaign),
    })
  }

  async sendCampaign(campaignId: string) {
    return this.request(`/api/campaigns/${campaignId}/send`, {
      method: "POST",
    })
  }

  async getCampaignLogs(campaignId?: string) {
    const query = campaignId ? `?campaignId=${campaignId}` : ""
    return this.request(`/api/campaigns/logs${query}`)
  }
}

export const apiClient = new ApiClient()
