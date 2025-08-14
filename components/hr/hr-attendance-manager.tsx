import React, { useState, useEffect, useCallback } from "react"
import { useEmployee } from "@/context/employee-context"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function HRAttendanceManager() {
  const { user } = useAuth();
  const { employees, fetchEmployeesByHR, markAttendance, updateAttendance, isLoading: employeesLoading, error: employeesError, fetchAttendanceSummaryByEmployee } = useEmployee();
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

  useEffect(() => {
    if (user?.role === "HR" && user?.id) {
      fetchEmployeesByHR(user.id);
    }
  }, [user?.role, user?.id, fetchEmployeesByHR]);

  useEffect(() => {
    if (employees.length > 0) {
      // Use Promise.all to fetch attendance for all employees concurrently
      Promise.all(employees.map(async emp => {
        await fetchEmployeeAttendanceForToday(String(emp.id), emp.fullName || "Unknown Employee");
        await fetchEmployeeMonthlySummary(String(emp.id), emp.fullName || "Unknown Employee");
      }));
    }
  }, [employees, fetchEmployeeAttendanceForToday, fetchEmployeeMonthlySummary]);

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
      alert("Missing employee data or HR user ID.");
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

  if (employeesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (employeesError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error loading employees: {employeesError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">HR Attendance Management</h2>
        <p className="text-muted-foreground">Mark and manage daily attendance for your employees.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance ({format(new Date(), "PPP")})</CardTitle>
          <CardDescription>Select status and mark attendance for each employee.</CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <p className="text-gray-500">No employees found for this HR.</p>
          ) : (
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
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    ) : employeeAttendance[String(employee.id)]?.error ? (
                      <span className="text-red-500 text-sm">Error: {employeeAttendance[String(employee.id)].error}</span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
} 