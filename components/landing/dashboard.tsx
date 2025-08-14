"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { EmployeeProvider } from "@/context/employee-context"
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"
import DashboardOverview from "@/components/common/dashboard-overview"
import EmployeeList from "@/components/employee/employee-list"
import AttendanceTracker from "@/components/attendance/attendance-tracker"
import LeaveManagement from "@/components/leave/leave-management"
import ProfileView from "@/components/profile/profile-view"
import SalarySlips from "@/components/salaryslip/salary-slips"
import HRTools from "@/components/hr/hr-tools"
import AdminPanel from "@/components/admin/admin-panel"
import HRAttendanceManager from "@/components/hr/hr-attendance-manager"
import GenerateSalarySlip from "@/components/hr/generate-salary-slip"
import HRList from "@/components/hr/hr-list"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { user } = useAuth()

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard"
      case "employees":
        return "Employee Management"
      case "hrs":
        return "HR Management"
      case "attendance":
        return "Attendance Tracking"
      case "leave":
        return "Leave Management"
      case "profile":
        return "My Profile"
      case "salary":
        return "Salary Slips"
      case "hr-attendance":
        return "Attendance Management (HR)"
      case "hr":
        return "HR Tools"
      case "generate-salary-slip":
        return "Generate Salary Slip"
      case "admin":
        return "Admin Panel"
      default:
        return "Dashboard"
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />
      case "employees":
        return <EmployeeList />
      case "hrs":
        return <HRList />
      case "attendance":
        return <AttendanceTracker />
      case "leave":
        return <LeaveManagement />
      case "profile":
        return <ProfileView />
      case "salary":
        return <SalarySlips />
      case "hr-attendance":
        return <HRAttendanceManager />
      case "hr":
        return <HRTools />
      case "generate-salary-slip":
        return <GenerateSalarySlip />
      case "admin":
        return <AdminPanel />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <EmployeeProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={getPageTitle()} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">{renderContent()}</main>
        </div>
      </div>
    </EmployeeProvider>
  )
}
