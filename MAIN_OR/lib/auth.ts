import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export interface User {
  id: string
  email: string
  name: string
  picture?: string
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return {
    id: session.user.email || "",
    email: session.user.email || "",
    name: session.user.name || "",
    picture: session.user.image || undefined,
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}
