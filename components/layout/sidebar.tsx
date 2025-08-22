"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  Home,
  Clock,
  UserCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user } = useAuth()
  console.log("[Sidebar] User from context:", user)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, roles: ["admin", "hr", "employee"] },
    { id: "employees", label: "Employees", icon: Users, roles: ["admin", "hr"] },
    { id: "hrs", label: "HRs", icon: Users, roles: ["admin"] },
    { id: "attendance", label: "Attendance", icon: Clock, roles: ["admin", "employee"] },
    { id: "leave", label: "Leave Management", icon: Calendar, roles: ["admin", "hr", "employee"] },
    { id: "profile", label: "My Profile", icon: UserCheck, roles: ["admin", "hr", "employee"] },
    { id: "salary", label: "Salary Slips", icon: DollarSign, roles: ["employee"] },
    { id: "generate-salary-slip", label: "Generate Salary Slip", icon: DollarSign, roles: ["hr", "admin"] },
    { id: "hr-attendance", label: "Attendance Management", icon: Clock, roles: ["hr"] },
    // { id: "hr", label: "HR Tools", icon: FileText, roles: ["admin", "hr"] },
    // { id: "admin", label: "Admin Panel", icon: Settings, roles: ["admin"] },
  ]

  const filteredMenuItems = menuItems.filter((item) => user?.role && item.roles.includes(user.role.toLowerCase()))

  if (!user || !user.role) {
    return (
      <div className="p-4">
        <span className="text-gray-500">No menu available. Please log in.</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-lg">EMS</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="p-1">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <Button
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={cn("w-full justify-start", isCollapsed ? "px-2" : "px-4")}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && item.label}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
