"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useEmployee } from "@/context/employee-context"
import { useAuth } from "@/context/auth-context"
import { Settings, Shield, Database, Users, Activity, Server, Lock, AlertTriangle, CheckCircle, Search, Clock, UserCheck, UserX, Calendar, DollarSign } from "lucide-react"

export default function AdminPanel() {
  const { employees, hrs, isLoading, isLoadingHRs, error, fetchAllEmployeesForAdmin, fetchAllHRs, markAttendance } = useEmployee()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user?.role === "ADMIN") {
      // Don't fetch here - let the context handle the sequential loading
      // This prevents duplicate API calls and ensures proper order
    }
  }, [user?.role])

  // Filter employees based on search term
  const filteredEmployees = employees.filter(emp => 
    emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAttendanceChange = async (employeeId: string, status: string) => {
    try {
      await markAttendance(employeeId, status)
      setAttendanceStatus(prev => ({ ...prev, [employeeId]: status }))
    } catch (error) {
      console.error("Failed to mark attendance:", error)
    }
  }

  const systemStats = [
    {
      title: "Total Employees",
      value: employees.length,
      icon: Users,
      description: "All employees across all HRs",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total HRs",
      value: hrs.length,
      icon: UserCheck,
      description: "HR personnel in system",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Active Employees",
      value: employees.filter(emp => emp.status === "active").length,
      icon: CheckCircle,
      description: "Currently active employees",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Average Salary",
      value: employees.length > 0 
        ? `$${Math.round(employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length).toLocaleString()}`
        : "$0",
      icon: DollarSign,
      description: "Average employee salary",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const adminTools = [
    {
      title: "Employee Management",
      description: "Manage all employees across all HRs",
      icon: Users,
      action: "Manage Employees",
      status: "active",
    },
    {
      title: "HR Management",
      description: "Manage HR accounts and permissions",
      icon: UserCheck,
      action: "Manage HRs",
      status: "active",
    },
    {
      title: "Attendance Overview",
      description: "View and manage attendance for all employees",
      icon: Clock,
      action: "View Attendance",
      status: "active",
    },
    {
      title: "System Settings",
      description: "Configure system parameters",
      icon: Settings,
      action: "Open Settings",
      status: "active",
    },
    {
      title: "Database Management",
      description: "Backup and restore database",
      icon: Database,
      action: "Manage DB",
      status: "active",
    },
    {
      title: "Security Center",
      description: "Monitor security and access logs",
      icon: Lock,
      action: "View Security",
      status: "active",
    },
  ]

  // Wait for both employees and HRs to be loaded
  // Show loading until we have both data sets
  const shouldShowLoading = (isLoading || isLoadingHRs) || (employees.length === 0 || hrs.length === 0);
  
  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <span>Employees:</span>
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              ) : (
                <span className={employees.length > 0 ? "text-green-600" : "text-gray-400"}>
                  {employees.length > 0 ? "✓ Loaded" : "Loading..."}
                </span>
              )}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span>HRs:</span>
              {isLoadingHRs ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              ) : (
                <span className={hrs.length > 0 ? "text-green-600" : "text-gray-400"}>
                  {hrs.length > 0 ? "✓ Loaded" : "Loading..."}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Complete overview and management of all employees and HRs</p>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Admin Tools */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminTools.map((tool, index) => {
          const Icon = tool.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                  </div>
                  <Badge variant={tool.status === "active" ? "default" : "secondary"}>{tool.status}</Badge>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled={tool.status === "maintenance"}>
                  {tool.action}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Employee Management Section */}
        <Card>
          <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Employees Management</CardTitle>
              <CardDescription>Manage attendance and view details for all employees across all HRs</CardDescription>
            </div>
            <Button 
              onClick={() => {
                fetchAllEmployeesForAdmin();
                fetchAllHRs();
              }}
              variant="outline"
              size="sm"
            >
              <Users className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          </CardHeader>
          <CardContent>
          {/* Search and Date Selection */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search employees by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>

          {/* Employee List */}
            <div className="space-y-4">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No employees found matching your search." : "No employees found."}
              </div>
            ) : (
              filteredEmployees.map((employee, index) => (
                <Card key={`${employee.id}-${index}`} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{employee.fullName || "Unknown Name"}</h3>
                        <p className="text-sm text-gray-600">{employee.email}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Dept: {typeof employee.department === 'string' ? employee.department : (employee.department as any)?.name || "N/A"}</span>
                          <span>Salary: ${employee.salary?.toLocaleString() || "N/A"}</span>
                          <span>Joined: {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                        {employee.status || "unknown"}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={attendanceStatus[employee.id] === "present" ? "default" : "outline"}
                          onClick={() => handleAttendanceChange(employee.id.toString(), "present")}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={attendanceStatus[employee.id] === "absent" ? "destructive" : "outline"}
                          onClick={() => handleAttendanceChange(employee.id.toString(), "absent")}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant={attendanceStatus[employee.id] === "late" ? "secondary" : "outline"}
                          onClick={() => handleAttendanceChange(employee.id.toString(), "late")}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Late
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Database className="mr-2 h-4 w-4" />
            Export Employee Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
            Bulk Attendance Update
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Generate System Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              System Maintenance Mode
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Security Audit
            </Button>
        </CardContent>
      </Card>
    </div>
  )
}
