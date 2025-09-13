"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Starting Google OAuth sign in...")

      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/dashboard",
      })

      console.log("[v0] Sign in result:", result)

      if (result?.ok) {
        const session = await getSession()
        console.log("[v0] Session after sign in:", session)

        if (session) {
          router.push("/dashboard")
        } else {
          setError("Failed to establish session. Please try again.")
        }
      } else {
        console.error("[v0] Login failed:", result?.error)
        setError(result?.error || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Mini CRM</CardTitle>
          <CardDescription>Sign in to access your customer management dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <Chrome className="w-5 h-5" />
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
