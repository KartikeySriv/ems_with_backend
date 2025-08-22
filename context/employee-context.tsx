"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { apiService, type Employee, type Department, type Role, type Leave, type HR, type Attendance, type AttendanceSummary, ApiResponse } from "@/services/api-service"
import { useAuth } from "@/context/auth-context"

interface EmployeeContextType {
  employees: Employee[]
  leaves: Leave[]
  hrs: HR[]
  attendance: Attendance[]
  attendanceSummary: AttendanceSummary | null
  isLoading: boolean
  isLoadingHRs: boolean
  error: string | null
  fetchEmployees: () => Promise<void>
  fetchLeavesByEmployee: (employeeId: string) => Promise<void>
  fetchLeavesByHR: (hrId: string) => Promise<void>
  fetchEmployeesByHR: (hrId: string) => Promise<ApiResponse<Employee[]>>
  applyLeave: (leaveData: Omit<Leave, "id" | "status" | "requestDate"> & { status?: string; requestDate?: string }) => Promise<void>
  updateLeaveStatus: (leaveId: string, status: string) => Promise<void>
  fetchAllHRs: () => Promise<void>
  fetchHRsByStatus: (status: string) => Promise<void>
  fetchHRsByAdmin: (adminId: string) => Promise<void>
  createHR: (hr: Omit<HR, "id"> & { username: string; password: string }) => Promise<void>
  updateHR: (id: string, hr: Partial<HR>) => Promise<void>
  deleteHR: (id: string) => Promise<void>
  fetchAttendanceByEmployee: (employeeId: string) => Promise<void>
  markAttendance: (employeeId: string, status: string) => Promise<ApiResponse<Attendance>>
  checkIn: (employeeId: string, time: { hour: number; minute: number; second: number; nano: number }) => Promise<void>
  checkOut: (employeeId: string, time: { hour: number; minute: number; second: number; nano: number }) => Promise<void>
  updateAttendance: (attendanceId: string, attendance: Partial<Attendance>) => Promise<ApiResponse<Attendance>>
  fetchSalary: (employeeId: string, month: number, year: number) => Promise<void>
  fetchAttendanceByRange: (startDate: string, endDate: string) => Promise<void>
  fetchAttendanceSummaryByEmployee: (
    employeeId: string,
    startDate: string,
    endDate: string,
  ) => Promise<ApiResponse<AttendanceSummary>>
  addEmployee: (employee: FormData) => Promise<boolean>
  updateEmployee: (id: number, employee: FormData) => Promise<boolean>
  deleteEmployee: (id: number) => Promise<boolean>
  createDepartment: (department: { name: string; description?: string }) => Promise<boolean>
  updateDepartment: (
    id: number,
    department: { name: string; description?: string },
  ) => Promise<boolean>
  deleteDepartment: (id: number) => Promise<boolean>
  createRole: (role: { name: string; description?: string }) => Promise<boolean>
  updateRole: (id: number, role: { name: string; description?: string }) => Promise<boolean>
  deleteRole: (id: number) => Promise<boolean>
  departments: Department[]
  roles: Role[]
  fetchDepartments: () => Promise<void>
  fetchRoles: () => Promise<void>
  generateSalarySlip: (employeeId: string, month: number, year: number, incentive: number) => Promise<boolean>
  fetchAllEmployeesForAdmin: () => Promise<void>
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined)

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [hrs, setHRs] = useState<HR[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setLoading] = useState(false)
  const [isLoadingHRs, setIsLoadingHRs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getEmployees()
      if (response.success && response.data) {
        setEmployees(response.data)
      } else {
        setError(response.message || "Failed to fetch employees")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLeavesByEmployee = useCallback(async (employeeId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getLeavesByEmployee(employeeId)
      if (response.success && response.data) {
        setLeaves(response.data)
      } else {
        setError(response.message || "Failed to fetch leaves")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLeavesByHR = useCallback(async (hrId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getLeavesByHR(hrId)
      if (response.success && response.data) {
        setLeaves(response.data)
      } else {
        setError(response.message || "Failed to fetch leaves")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEmployeesByHR = useCallback(async (hrId: string): Promise<ApiResponse<Employee[]>> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getEmployeesByHR(hrId)
      if (response.success && response.data) {
        setEmployees(response.data)
        return response
      } else {
        setError(response.message || "Failed to fetch employees by HR")
        return { data: [], success: false, message: response.message || "Failed to fetch employees by HR" }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return { data: [], success: false, message: err instanceof Error ? err.message : "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }, [])

  const applyLeave = useCallback(async (leaveData: Omit<Leave, "id" | "status" | "requestDate"> & { status?: string; requestDate?: string }): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.applyLeave(leaveData)
      if (response.success) {
        // Refresh leaves if needed
        if (user?.role === "ADMIN" && user.id) fetchLeavesByHR(user.id)
        else if (user?.role === "HR" && user.id) fetchLeavesByHR(user.id)
        else if (user?.role === "EMPLOYEE" && user.id) fetchLeavesByEmployee(user.id)
      } else {
        setError(response.message || "Failed to apply leave")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [user?.role, user?.id, fetchLeavesByHR, fetchLeavesByEmployee])

  const updateLeaveStatus = useCallback(async (leaveId: string, status: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.updateLeaveStatus(leaveId, status)
      if (response.success) {
        // Refresh leaves if needed
        if (user?.role === "ADMIN" && user.id) fetchLeavesByHR(user.id)
        else if (user?.role === "HR" && user.id) fetchLeavesByHR(user.id)
        else if (user?.role === "EMPLOYEE" && user.id) fetchLeavesByEmployee(user.id)
      } else {
        setError(response.message || "Failed to update leave status")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [user?.role, user?.id, fetchLeavesByHR, fetchLeavesByEmployee])

  const fetchAllHRs = useCallback(async () => {
    console.log("fetchAllHRs called - starting to fetch HRs");
    setIsLoadingHRs(true)
    setError(null)
    try {
      const response = await apiService.getAllHRs()
      console.log("fetchAllHRs response:", response);
      if (response.success && response.data) {
        console.log("Setting HRs:", response.data);
        setHRs(response.data)
      } else {
        console.error("Failed to fetch HRs:", response.message);
        setError(response.message || "Failed to fetch HRs")
      }
    } catch (err) {
      console.error("Error in fetchAllHRs:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      console.log("fetchAllHRs completed, setting isLoadingHRs to false");
      setIsLoadingHRs(false)
    }
  }, [])

  const fetchHRsByStatus = useCallback(async (status: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getHRsByStatus(status)
      if (response.success && response.data) {
        setHRs(response.data)
      } else {
        setError(response.message || "Failed to fetch HRs by status")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHRsByAdmin = useCallback(async (adminId: string) => {
    setIsLoadingHRs(true)
    setError(null)
    try {
      const response = await apiService.getHRsByAdmin(adminId)
      if (response.success && response.data) {
        setHRs(response.data)
      } else {
        setError(response.message || "Failed to fetch HRs by admin")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoadingHRs(false)
    }
  }, [])



  const fetchAllEmployeesForAdmin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAllEmployeesForAdmin();
      if (response.success && response.data) {
        setEmployees(response.data);
      } else {
        setError(response.message || "Failed to fetch all employees for admin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching all employees for admin");
    } finally {
      setLoading(false);
    }
  }, [setEmployees, setError]);

  const createHR = useCallback(async (hr: Omit<HR, "id"> & { username: string; password: string }): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.createHR(hr)
      if (response.success) {
        // Refresh HR list based on user role
        if (user?.role === "ADMIN" && user?.id) {
          fetchHRsByAdmin(user.id) // Refresh only HRs managed by this admin
        } else {
          fetchAllHRs() // Refresh all HRs for other roles
        }
      } else {
        setError(response.message || "Failed to create HR")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [fetchAllHRs, fetchHRsByAdmin, user?.role, user?.id])

  const updateHR = useCallback(async (id: string, hr: Partial<HR>): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.updateHR(id, hr)
      if (response.success) {
        // Refresh HR list based on user role
        if (user?.role === "ADMIN" && user?.id) {
          fetchHRsByAdmin(user.id) // Refresh only HRs managed by this admin
        } else {
          fetchAllHRs() // Refresh all HRs for other roles
        }
      } else {
        setError(response.message || "Failed to update HR")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [fetchAllHRs, fetchHRsByAdmin, user?.role, user?.id])

  const deleteHR = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.deleteHR(id)
      if (response.success) {
        // Refresh HR list based on user role
        if (user?.role === "ADMIN" && user?.id) {
          fetchHRsByAdmin(user.id) // Refresh only HRs managed by this admin
        } else {
          fetchAllHRs() // Refresh all HRs for other roles
        }
      } else {
        setError(response.message || "Failed to delete HR")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [fetchAllHRs, fetchHRsByAdmin, user?.role, user?.id])

  const fetchAttendanceByEmployee = useCallback(async (employeeId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getAttendanceByEmployee(employeeId)
      if (response.success && response.data) {
        setAttendance(response.data)
      } else {
        setError(response.message || "Failed to fetch attendance")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const markAttendance = useCallback(async (employeeId: string, status: string): Promise<ApiResponse<Attendance>> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.markAttendance(employeeId, status)
      if (response.success) {
        // Don't auto-refresh - let the calling component manage its own state
        return response
      } else {
        setError(response.message || "Failed to mark attendance")
        return { data: {} as Attendance, success: false, message: response.message || "Failed to mark attendance" }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return { data: {} as Attendance, success: false, message: err instanceof Error ? err.message : "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }, [])

  const checkIn = useCallback(async (employeeId: string, time: { hour: number; minute: number; second: number; nano: number }): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.checkIn(employeeId, time)
      if (response.success) {
        fetchAttendanceByEmployee(employeeId)
      } else {
        setError(response.message || "Failed to check in")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [fetchAttendanceByEmployee])

  const checkOut = useCallback(async (employeeId: string, time: { hour: number; minute: number; second: number; nano: number }): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.checkOut(employeeId, time)
      if (response.success) {
        fetchAttendanceByEmployee(employeeId)
      } else {
        setError(response.message || "Failed to check out")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [fetchAttendanceByEmployee])

  const updateAttendance = useCallback(async (attendanceId: string, attendanceData: Partial<Attendance>): Promise<ApiResponse<Attendance>> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.updateAttendance(attendanceId, attendanceData)
      if (response.success) {
        // You might want to refresh the attendance list for the employee or relevant view
        // fetchAttendanceByEmployee(employeeId); // Need employeeId here
        return response
      } else {
        setError(response.message || "Failed to update attendance")
        return { data: {} as Attendance, success: false, message: response.message || "Failed to update attendance" }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return { data: {} as Attendance, success: false, message: err instanceof Error ? err.message : "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSalary = useCallback(async (employeeId: string, month: number, year: number): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getSalary(employeeId, month, year)
      if (response.success && response.data) {
        // Handle salary data
      } else {
        setError(response.message || "Failed to fetch salary")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAttendanceByRange = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getAttendanceByRange(startDate, endDate)
      if (response.success && response.data) {
        setAttendance(response.data)
      } else {
        setError(response.message || "Failed to fetch attendance by range")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAttendanceSummaryByEmployee = useCallback(async (
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<AttendanceSummary>> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getAttendanceSummaryByEmployee(employeeId, startDate, endDate)
      if (response.success && response.data) {
        setAttendanceSummary(response.data)
        return response
      } else {
        setError(response.message || "Failed to fetch attendance summary")
        return { data: {} as AttendanceSummary, success: false, message: response.message || "Failed to fetch attendance summary" }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return { data: {} as AttendanceSummary, success: false, message: err instanceof Error ? err.message : "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }, [])

  const addEmployee = useCallback(async (employeeData: FormData): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.createEmployee(employeeData)
      if (response.success) {
        // Refresh employee list based on user role
        if (user?.role === "HR" && user?.id) {
          await fetchEmployeesByHR(user.id);
        } else {
          await fetchEmployees();
        }
        return true
      } else {
        setError(response.message || "Failed to add employee")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.role, user?.id, fetchEmployees, fetchEmployeesByHR])

  const updateEmployee = useCallback(async (id: number, employeeData: FormData): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.updateEmployee(id, employeeData)
      if (response.success) {
        fetchEmployees()
        return true
      } else {
        setError(response.message || "Failed to update employee")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchEmployees])

  const deleteEmployee = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.deleteEmployee(id)
      if (response.success) {
        fetchEmployees()
        return true
      } else {
        setError(response.message || "Failed to delete employee")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchEmployees])

  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getDepartments()
      if (response.success && response.data) {
        setDepartments(response.data)
      } else {
        setError(response.message || "Failed to fetch departments")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const createDepartment = useCallback(async (departmentData: { name: string; description?: string }): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.createDepartment(departmentData)
      if (response.success) {
        fetchDepartments() // Refresh list
        return true
      } else {
        setError(response.message || "Failed to create department")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchDepartments])

  const updateDepartment = useCallback(async (
    id: number,
    departmentData: { name: string; description?: string },
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.updateDepartment(id, departmentData)
      if (response.success) {
        fetchDepartments() // Refresh list
        return true
      } else {
        setError(response.message || "Failed to update department")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchDepartments])

  const deleteDepartment = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.deleteDepartment(id)
      if (response.success) {
        fetchDepartments() // Refresh list
        return true
      } else {
        setError(response.message || "Failed to delete department")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchDepartments])

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getRoles()
      if (response.success && response.data) {
        setRoles(response.data)
      } else {
        setError(response.message || "Failed to fetch roles")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const createRole = useCallback(async (roleData: { name: string; description?: string }): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.createRole(roleData)
      if (response.success) {
        fetchRoles() // Refresh list
        return true
      } else {
        setError(response.message || "Failed to create role")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchRoles])

  const updateRole = useCallback(async (id: number, roleData: { name: string; description?: string }): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.updateRole(id, roleData)
      if (response.success) {
        fetchRoles() // Refresh list
        return true
      } else {
        setError(response.message || "Failed to update role")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchRoles])

  const deleteRole = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.deleteRole(id)
      if (response.success) {
        fetchRoles() // Refresh list
        return true
      } else {
        setError(response.message || "Failed to delete role")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchRoles])

  const generateSalarySlip = useCallback(async (employeeId: string, month: number, year: number, incentive: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.generateSalarySlip(employeeId, month, year, incentive)
      if (response.success) {
        return true
      } else {
        setError(response.message || "Failed to generate salary slip")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role === "HR" && user?.id) {
      fetchEmployeesByHR(user.id);
    } else if (user?.role === "ADMIN" && user?.id) {
      // For admin, fetch only HRs managed by this admin, then all employees
      // This ensures HR count is accurate for the specific admin
      const loadAdminData = async () => {
        try {
          await fetchHRsByAdmin(user.id); // Fetch only HRs managed by this admin
          await fetchAllEmployeesForAdmin(); // Then load all employees
        } catch (error) {
          console.error("Error loading admin data:", error);
        }
      };
      loadAdminData();
    } else if (user?.role === "EMPLOYEE" && user?.hrId) {
      // For employee users, fetch employees managed by their HR
      // This ensures employee sees count of their HR's employees
      fetchEmployeesByHR(user.hrId);
    } else if (user?.role) {
      fetchEmployees();
    }
  }, [user?.role, user?.id, user?.hrId, fetchEmployees, fetchEmployeesByHR, fetchHRsByAdmin, fetchAllEmployeesForAdmin]);

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        leaves,
        hrs,
        attendance,
        attendanceSummary,
        isLoading,
        isLoadingHRs,
        error,
        fetchEmployees,
        fetchLeavesByEmployee,
        fetchLeavesByHR,
        fetchEmployeesByHR,
        applyLeave,
        updateLeaveStatus,
        fetchAllHRs,
        fetchHRsByStatus,
        fetchHRsByAdmin,
        createHR,
        updateHR,
        deleteHR,
        fetchAttendanceByEmployee,
        markAttendance,
        checkIn,
        checkOut,
        updateAttendance,
        fetchSalary,
        fetchAttendanceByRange,
        fetchAttendanceSummaryByEmployee,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        createRole,
        updateRole,
        deleteRole,
        departments,
        roles,
        fetchDepartments,
        fetchRoles,
        generateSalarySlip,
        fetchAllEmployeesForAdmin,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployee() {
  const context = useContext(EmployeeContext)
  if (context === undefined) {
    throw new Error("useEmployee must be used within an EmployeeProvider")
  }
  return context
}
