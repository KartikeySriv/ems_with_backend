"use client";

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { apiService, Leave } from "@/services/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useEmployee } from "@/context/employee-context"

export function LeaveRequestBox() {
  const { user } = useAuth()
  const { leaves, isLoading, error, fetchLeavesByEmployee, fetchLeavesByHR } = useEmployee()

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)

        let response
        if (user.role?.toLowerCase() === "employee" && user.id) {
          await fetchLeavesByEmployee(user.id)
        } else if (user.role?.toLowerCase() === "hr" && user.hrId) {
          await fetchLeavesByHR(user.hrId)
        }

        // The setLeaveRequests is no longer needed here as data is from context
        // setLeaveRequests(response.data)
      } catch (err) {
        setError("An error occurred while fetching leave requests")
        console.error(err)
      } finally {
        setIsLoading(false) // This isLoading state should ideally come from useEmployee context
      }
    }

    fetchLeaveRequests()
  }, [user, fetchLeavesByEmployee, fetchLeavesByHR]) // Add fetchLeavesByEmployee and fetchLeavesByHR to dependencies

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500"
      case "REJECTED":
        return "bg-red-500"
      case "PENDING":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading leave requests...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (leaves.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No leave requests found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaves.map((leave) => (
            <div
              key={leave.id}
              className="p-4 border rounded-lg space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {format(new Date(leave.fromDate), "MMM dd, yyyy")} -{" "}
                    {format(new Date(leave.toDate), "MMM dd, yyyy")}
                  </p>
                  <p className="text-sm text-gray-500">{leave.reason}</p>
                </div>
                <Badge className={getStatusColor(leave.status)}>
                  {leave.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                Requested on: {format(new Date(leave.requestDate), "MMM dd, yyyy")}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 