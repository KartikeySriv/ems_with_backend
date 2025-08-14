"use client"

import { useState, useEffect, useCallback } from "react"
import { useEmployee } from "@/context/employee-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { format, startOfDay, startOfMonth } from "date-fns"
import { Attendance } from "@/services/api-service"

interface EmployeeAttendanceStatus {
  employeeId: string;
  fullName: string;
  currentStatus: string;
  attendanceId: string | null;
  isLoading: boolean;
  error: string | null;
  presentCount?: number;
  absentCount?: number;
}

export default function AttendanceTracker() {
  const { user } = useAuth()
  const {
    employees,
    hrs,
    fetchAttendanceSummaryByEmployee,
    attendanceSummary,
    isLoading: employeesLoading, // Renamed to avoid conflict
    isLoadingHRs,
    error: employeesError, // Renamed to avoid conflict
    markAttendance,
    updateAttendance,
  } = useEmployee()

  const [employeeAttendance, setEmployeeAttendance] = useState<{[key: string]: EmployeeAttendanceStatus}>({});
  const [isSubmitting, setIsSubmitting] = useState<{[key: string]: boolean}>({});

  const today = format(startOfDay(new Date()), "yyyy-MM-dd");
  const firstDayOfMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const fetchEmployeeAttendanceForToday = useCallback(async (employeeId: string, employeeFullName: string) => {
    setEmployeeAttendance(prev => ({
      ...prev,
      [employeeId]: {
        employeeId,
        fullName: employeeFullName,
        currentStatus: "",
        attendanceId: null,
        isLoading: true,
        error: null,
      }
    }));
    try {
      const response = await fetch(`https://employee-management-system-pahv.onrender.com/api/attendance/${employeeId}/report?date=${today}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Attendance[] = await response.json();
      const todaysAttendance = data.find(att => format(new Date(att.date), "yyyy-MM-dd") === today);

      setEmployeeAttendance(prev => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          currentStatus: todaysAttendance?.status || "NOT_MARKED",
          attendanceId: todaysAttendance?.id || null,
          isLoading: false,
        }
      }));
    } catch (err: any) {
      setEmployeeAttendance(prev => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          error: err.message || "Failed to fetch attendance",
          isLoading: false,
        }
      }));
      console.error(`Error fetching attendance for ${employeeFullName}:`, err);
    }
  }, [today]);

  const fetchEmployeeMonthlySummary = useCallback(async (employeeId: string, employeeFullName: string) => {
    setEmployeeAttendance(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        isLoading: true,
        error: null,
      }
    }));
    try {
      const summaryResponse = await fetchAttendanceSummaryByEmployee(employeeId, firstDayOfMonth, today);
      console.log(`[Attendance Summary] Employee ${employeeFullName} (${employeeId}) - Summary for ${firstDayOfMonth} to ${today}:`, summaryResponse);
      if (summaryResponse.success && summaryResponse.data) {
        setEmployeeAttendance(prev => ({
          ...prev,
          [employeeId]: {
            ...prev[employeeId],
            presentCount: summaryResponse.data.presentCount,
            absentCount: summaryResponse.data.absentCount,
            isLoading: false,
          }
        }));
      } else {
        setEmployeeAttendance(prev => ({
          ...prev,
          [employeeId]: {
            ...prev[employeeId],
            error: summaryResponse.message || "Failed to fetch attendance summary",
            isLoading: false,
          }
        }));
        console.error(`Error fetching summary for ${employeeFullName}:`, summaryResponse.message);
      }
    } catch (err: any) {
      setEmployeeAttendance(prev => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          error: err.message || "Failed to fetch attendance summary",
          isLoading: false,
        }
      }));
      console.error(`Error fetching attendance summary for ${employeeFullName}:`, err);
    }
  }, [firstDayOfMonth, today, fetchAttendanceSummaryByEmployee]);

  const handleAttendanceChange = useCallback((employeeId: string, status: string) => {
    setEmployeeAttendance(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        currentStatus: status,
      }
    }));
  }, []);

  const handleSubmitAttendance = useCallback(async (employeeId: string) => {
    setIsSubmitting(prev => ({ ...prev, [employeeId]: true }));
    const currentEmployeeStatus = employeeAttendance[employeeId];

    if (!currentEmployeeStatus || !user?.id) {
      alert("Missing employee data or user ID.");
      setIsSubmitting(prev => ({ ...prev, [employeeId]: false }));
      return;
    }

    try {
      let success = false;
      let attendanceId = currentEmployeeStatus.attendanceId;

      if (attendanceId && currentEmployeeStatus.currentStatus !== "NOT_MARKED") {
        // Update existing attendance
        const updateResponse = await updateAttendance(
          attendanceId,
          { status: currentEmployeeStatus.currentStatus, date: today, employeeId: employeeId}
        );
        success = updateResponse.success;
        if (!success) {
            setEmployeeAttendance(prev => ({
                ...prev,
                [employeeId]: {
                    ...prev[employeeId],
                    error: updateResponse.message || "Failed to update attendance",
                }
            }));
        }
      } else {
        // Mark new attendance
        const markResponse = await markAttendance(
          employeeId,
          currentEmployeeStatus.currentStatus
        );
        success = markResponse.success;
        if (success) {
          attendanceId = markResponse.data.id; // Get attendance ID from POST response
          setEmployeeAttendance(prev => ({
            ...prev,
            [employeeId]: {
              ...prev[employeeId],
              attendanceId: attendanceId,
              error: null,
            }
          }));
        } else {
            setEmployeeAttendance(prev => ({
                ...prev,
                [employeeId]: {
                    ...prev[employeeId],
                    error: markResponse.message || "Failed to mark attendance",
                }
            }));
        }
      }

      if (success) {
        alert(`Attendance for ${currentEmployeeStatus.fullName} ${currentEmployeeStatus.currentStatus.toLowerCase()} successfully!`);
        // Refresh attendance for this employee to show the latest status
        await fetchEmployeeAttendanceForToday(employeeId, currentEmployeeStatus.fullName);
        await fetchEmployeeMonthlySummary(employeeId, currentEmployeeStatus.fullName);
      } else {
        // Error message already set by the specific calls
        alert("Operation failed. See console for details.");
      }
    } catch (err: any) {
      setEmployeeAttendance(prev => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          error: err.message || "An unexpected error occurred during attendance operation.",
        }
      }));
      alert("An unexpected error occurred. See console for details.");
      console.error("Attendance operation error:", err);
    } finally {
      setIsSubmitting(prev => ({ ...prev, [employeeId]: false }));
    }
  }, [employeeAttendance, user?.id, markAttendance, updateAttendance, today, fetchEmployeeAttendanceForToday, fetchEmployeeMonthlySummary]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT": return <Badge className="bg-green-500">Present</Badge>;
      case "LEAVE": return <Badge className="bg-blue-500">Leave</Badge>;
      case "ABSENT": return <Badge className="bg-red-500">Absent</Badge>;
      case "HALF_DAY": return <Badge className="bg-yellow-500">Half Day</Badge>;
      case "NOT_MARKED": return <Badge variant="outline">Not Marked</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  useEffect(() => {
    if (user?.role === "EMPLOYEE" && user?.id) {
      const today = new Date();
      const firstDayOfMonth = startOfMonth(today);
      const startDate = format(firstDayOfMonth, "yyyy-MM-dd");
      const endDate = format(today, "yyyy-MM-dd");
      fetchAttendanceSummaryByEmployee(user.id, startDate, endDate);
    }
    // For admin users, employees are already loaded by the context
    // No need to fetch here as the context handles it
  }, [user?.role, user?.id, fetchAttendanceSummaryByEmployee]);

  useEffect(() => {
    if (user?.role === "ADMIN" && employees.length > 0) {
      Promise.all(employees.map(async emp => {
        await fetchEmployeeAttendanceForToday(String(emp.id), emp.fullName || "Unknown Employee");
        await fetchEmployeeMonthlySummary(String(emp.id), emp.fullName || "Unknown Employee");
      }));
    }
  }, [employees, user?.role, fetchEmployeeAttendanceForToday, fetchEmployeeMonthlySummary]);

  // For admin users, wait for both employees and HRs to be loaded
  // Show loading until we have both data sets
  const shouldShowLoading = user?.role === "ADMIN" 
    ? (employeesLoading || isLoadingHRs) || (employees.length === 0 || hrs.length === 0)
    : employeesLoading && employees.length === 0;

  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {user?.role === "ADMIN" 
              ? "Loading attendance data (employees and HRs)..."
              : "Loading attendance data..."
            }
          </p>
          {user?.role === "ADMIN" && (
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <span>Employees:</span>
                {employeesLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className={employees.length > 0 ? "text-green-600" : "text-gray-400"}>
                    {employees.length > 0 ? "✓ Loaded" : "Loading..."}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>HRs:</span>
                {isLoadingHRs ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className={hrs.length > 0 ? "text-green-600" : "text-gray-400"}>
                    {hrs.length > 0 ? "✓ Loaded" : "Loading..."}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (employeesError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error loading data: {employeesError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Attendance Tracking</h2>
        <p className="text-muted-foreground">
            {user?.role === "ADMIN" ? "Mark and manage daily attendance for all employees across all HRs." : "Monitor and manage your attendance for the current month"}
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <Button 
            onClick={() => {
              // Refresh the page to reload all data
              window.location.reload();
            }}
            variant="outline"
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        )}
      </div>

      {user?.role === "EMPLOYEE" && attendanceSummary && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {attendanceSummary?.presentCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">Days present in current month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent This Month</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {attendanceSummary?.absentCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">Days absent in current month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {user?.role === "ADMIN" && employees.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {employees.length}
              </div>
              <p className="text-xs text-muted-foreground">All employees across all HRs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Date</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {format(new Date(), "MMM dd")}
              </div>
              <p className="text-xs text-muted-foreground">Current date for attendance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Status</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(employeeAttendance).filter(att => att.currentStatus !== "NOT_MARKED").length}
              </div>
              <p className="text-xs text-muted-foreground">Employees with marked attendance</p>
            </CardContent>
          </Card>
        </div>
      )}

      {user?.role === "ADMIN" && ((employeesLoading || isLoadingHRs) || (employees.length === 0 || hrs.length === 0) ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading employees and HRs...</p>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <span>Employees:</span>
                {employeesLoading ? (
                  <Loader2 className="h-2 w-2 animate-spin" />
                ) : (
                  <span className={employees.length > 0 ? "text-green-600" : "text-gray-400"}>
                    {employees.length > 0 ? "✓" : "..."}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>HRs:</span>
                {isLoadingHRs ? (
                  <Loader2 className="h-2 w-2 animate-spin" />
                ) : (
                  <span className={hrs.length > 0 ? "text-green-600" : "text-gray-400"}>
                    {hrs.length > 0 ? "✓" : "..."}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No employees found</p>
          <p className="text-sm text-gray-400 mb-4">Please refresh the page or check if employees are loaded from the context.</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance ({format(new Date(), "PPP")})</CardTitle>
            <CardDescription>Select status and mark attendance for all employees across all HRs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {employees.map(employee => (
                <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt={employee.fullName || "Employee"} />
                      <AvatarFallback>{employee.fullName ? employee.fullName[0] : "E"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.fullName}</p>
                      <p className="text-sm text-muted-foreground">{(typeof employee.role === 'object' && employee.role !== null) ? employee.role.name : employee.role}</p>
                      {employeeAttendance[String(employee.id)]?.presentCount !== undefined &&
                        employeeAttendance[String(employee.id)]?.absentCount !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Present: {employeeAttendance[String(employee.id)].presentCount} | Absent: {employeeAttendance[String(employee.id)].absentCount}
                          </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {employeeAttendance[String(employee.id)]?.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    ) : employeeAttendance[String(employee.id)]?.error ? (
                      <div className="flex flex-col">
                      <span className="text-red-500 text-sm">Error: {employeeAttendance[String(employee.id)].error}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            fetchEmployeeAttendanceForToday(String(employee.id), employee.fullName || "Unknown Employee");
                            fetchEmployeeMonthlySummary(String(employee.id), employee.fullName || "Unknown Employee");
                          }}
                          className="mt-1"
                        >
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={employeeAttendance[String(employee.id)]?.currentStatus || "NOT_MARKED"}
                        onValueChange={(value) => handleAttendanceChange(String(employee.id), value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRESENT">Present</SelectItem>
                          <SelectItem value="LEAVE">Leave</SelectItem>
                          <SelectItem value="ABSENT">Absent</SelectItem>
                          <SelectItem value="HALF_DAY">Half Day</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <Button
                      onClick={() => handleSubmitAttendance(String(employee.id))}
                      disabled={isSubmitting[String(employee.id)] || employeeAttendance[String(employee.id)]?.isLoading}
                    >
                      {isSubmitting[String(employee.id)] ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        employeeAttendance[String(employee.id)]?.currentStatus === "NOT_MARKED" ? "Mark Attendance" : "Update Attendance"
                      )}
                    </Button>
                    {employeeAttendance[String(employee.id)]?.currentStatus !== "NOT_MARKED" && (
                        getStatusBadge(employeeAttendance[String(employee.id)]?.currentStatus || "")
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
