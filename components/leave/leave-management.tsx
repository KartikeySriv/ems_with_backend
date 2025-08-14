"use client"

import { useState, useEffect } from "react"
import { useEmployee } from "@/context/employee-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, Check, X } from "lucide-react"
import LeaveRequestDialog from "./leave-request-dialog"

export default function LeaveManagement() {
  const { leaves, fetchLeavesByEmployee, fetchLeavesByHR, updateLeaveStatus, employees } = useEmployee()
  const { user } = useAuth()
  const [showRequestDialog, setShowRequestDialog] = useState(false)

  useEffect(() => {
    if (user?.role === "ADMIN" && user.id) fetchLeavesByHR(user.id)
    else if (user?.role === "HR" && user.id) fetchLeavesByHR(user.id)
    else if (user?.role === "EMPLOYEE" && user.id) fetchLeavesByEmployee(user.id)
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "PENDING":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => String(emp.id) === String(employeeId))
    return employee ? employee.fullName : "Unknown Employee"
  }

  const allLeaves = leaves

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leave Management</h2>
          <p className="text-muted-foreground">Manage leave requests and approvals</p>
        </div>
        {(user?.role === "HR" || user?.role === "EMPLOYEE") && (
          <Button onClick={() => setShowRequestDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Request Leave
          </Button>
        )}
      </div>

      {/* Leave Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allLeaves.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {allLeaves.filter((l) => l.status === "PENDING").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allLeaves.filter((l) => l.status === "APPROVED").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {allLeaves.filter((l) => l.status === "REJECTED").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            {user?.role === "admin" || user?.role === "hr" ? "All employee leave requests" : "Your leave requests"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allLeaves.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No leave requests found</div>
            ) : (
              allLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{getEmployeeName(leave.employeeId)}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{leave.reason}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>From: {new Date(leave.fromDate).toLocaleDateString()}</span>
                      <span>To: {new Date(leave.toDate).toLocaleDateString()}</span>
                      <span>
                        Duration:{" "}
                        {Math.ceil(
                          (new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + 1} days
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>

                    {(user?.role?.toUpperCase() === "ADMIN" || user?.role?.toUpperCase() === "HR") && leave.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => updateLeaveStatus(leave.id, "APPROVED")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateLeaveStatus(leave.id, "REJECTED")}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <LeaveRequestDialog open={showRequestDialog} onOpenChange={setShowRequestDialog} />
    </div>
  )
}
