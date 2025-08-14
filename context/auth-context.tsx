"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { apiService, LoginRequest, LoginResponse, UserDetails } from "@/services/api-service"

interface AuthContextType {
  user: {
    token: string | null
    role: string | null
    username: string | null
    id?: string
    hrId?: string
    fullName?: string | null
    employeeId?: string
    referredByAdminId?: string
  } | null
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("userRole")
    const username = localStorage.getItem("username")
    const id = localStorage.getItem("id")
    const hrId = localStorage.getItem("hrId")
    const fullName = localStorage.getItem("fullName")
    const employeeId = localStorage.getItem("employeeId")
    const referredByAdminId = localStorage.getItem("referredByAdminId")

    if (token && role && username) {
      setUser({
        token,
        role,
        username,
        id: id || undefined,
        hrId: hrId || undefined,
        fullName: fullName || undefined,
        employeeId: employeeId || undefined,
        referredByAdminId: referredByAdminId || undefined,
      })
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiService.login(credentials)
      if (response.success) {
        const { token, role } = response.data

        // Fetch user details after successful login
        const userDetailsResponse = await apiService.getUserDetails(credentials.username)
        if (userDetailsResponse.success) {
          const userDetails = userDetailsResponse.data
          
          // Store all necessary data
          localStorage.setItem("authToken", token)
          localStorage.setItem("userRole", role)
          localStorage.setItem("username", credentials.username)
          if (userDetails.id) localStorage.setItem("id", userDetails.id)
          if (userDetails.hrId) localStorage.setItem("hrId", userDetails.hrId)
          if (userDetails.fullName) localStorage.setItem("fullName", userDetails.fullName)
          if (userDetails.employeeId) localStorage.setItem("employeeId", userDetails.employeeId)
          if (userDetails.referredByAdminId) localStorage.setItem("referredByAdminId", userDetails.referredByAdminId)

          setUser({
            token,
            role,
            username: credentials.username,
            id: userDetails.id,
            hrId: userDetails.hrId,
            fullName: userDetails.fullName,
            employeeId: userDetails.employeeId,
            referredByAdminId: userDetails.referredByAdminId,
          })
        } else {
          throw new Error("Failed to fetch user details")
        }
      } else {
        throw new Error(response.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("username")
    localStorage.removeItem("id")
    localStorage.removeItem("hrId")
    localStorage.removeItem("fullName")
    localStorage.removeItem("employeeId")
    localStorage.removeItem("referredByAdminId")
    setUser(null)
    }

  const isAuthenticated = !!(user && user.token)

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
