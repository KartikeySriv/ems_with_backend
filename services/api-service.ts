// API service for connecting to the backend hosted on Render
const BASE_URL = "https://employee-management-system-pahv.onrender.com"

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  role: string
}

export interface Employee {
  id: number
  firstName?: string
  lastName?: string
  fullName?: string
  email: string
  phone?: string
  phoneNumber?: string
  address?: string
  dateOfBirth?: string
  hireDate?: string
  joiningDate?: number
  salary?: number
  status?: string
  departmentId?: number
  roleId?: number
  department?: {
    id: number
    name: string
    description?: string
  } | string
  role?: {
    id: number
    name: string
    description?: string
  } | string
}

export interface EmployeeDetails extends Employee {
  phoneNumber: string;
  whatsappNumber?: string;
  linkedInUrl?: string;
  currentAddress?: string;
  permanentAddress?: string;
  photograph?: string; // Stored as byte[] (number[]) - now string (Base64)
  collegeName?: string;
  tenthMarksheet?: string; // Stored as byte[] (number[]) - now string (Base64)
  twelfthMarksheet?: string; // Stored as byte[] (number[]) - now string (Base64)
  bachelorDegree?: string; // Stored as byte[] (number[]) - now string (Base64)
  postgraduateDegree?: string; // Stored as byte[] (number[]) - now string (Base64)
  aadharCard?: string; // Stored as byte[] (number[]) - now string (Base64)
  panCard?: string; // Stored as byte[] (number[]) - now string (Base64)
  pcc?: string; // Stored as byte[] (number[]) - now string (Base64)
  resume?: string; // Stored as byte[] (number[]) - now string (Base64)
  offerLetter?: string; // Stored as byte[] (number[]) - now string (Base64)
  internshipDuration?: number;
  hrId?: string;
}

export interface CreateEmployeeJsonPayload {
  fullName: string;
  email: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  linkedInUrl?: string;
  currentAddress?: string;
  permanentAddress?: string;
  collegeName?: string;
  role: string;
  department: string;
  joiningDate: number;
  internshipDuration?: number;
  status?: string;
  salary: number;
  hrId?: string; // The HR ID of the person adding the employee
}

export interface CreateEmployeeResponse {
  id: string; // Assuming employee ID is a string (UUID) from backend
  fullName: string;
  email: string;
  // ... other fields that the backend returns upon successful creation
}

export interface Department {
  id: number
  name: string
  description?: string
}

export interface Role {
  id: number
  name: string
  description?: string
}

export interface CreateEmployeeRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  dateOfBirth?: string
  hireDate: string
  salary: number
  departmentId: number
  roleId: number
}

export interface Leave {
  id: string;
  employeeId: string;
  hrId?: string;
  fromDate: string;
  toDate: string;
  reason: string;
  overrideAutoReject: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "AUTO_REJECTED";
  requestDate: string;
}

export interface HR {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  referredByAdminId: string;
  joiningDate: number;
  status: string;
  username?: string;
  password?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkInTime?: { hour: number; minute: number; second: number; nano: number };
  checkOutTime?: { hour: number; minute: number; second: number; nano: number };
  status: string;
}

export interface UserDetails {
  id: string;
  username: string;
  role: string;
  employeeId?: string;
  hrId?: string;
  fullName?: string;
  referredByAdminId?: string;
}

export interface AttendanceSummary {
  attendanceList: Attendance[];
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private getAuthHeadersNoContentType(): HeadersInit {
    const token = localStorage.getItem("authToken")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        data: {} as LoginResponse,
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      }
    }
  }

  // Employee endpoints
  async getEmployees(): Promise<ApiResponse<Employee[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/employees`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("Get employees error:", error)
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch employees",
      }
    }
  }

  async getAllEmployeesForAdmin(): Promise<ApiResponse<Employee[]>> {
    try {
      // Use the existing getEmployees endpoint since the admin-specific one doesn't exist
      return await this.getEmployees()
    } catch (error) {
      console.error("Get all employees for admin error:", error)
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch employees"
      }
    }
  }

  async getEmployee(id: number): Promise<ApiResponse<Employee>> {
    try {
      const response = await fetch(`${BASE_URL}/api/employees/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("Get employee error:", error)
      return {
        data: {} as Employee,
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch employee",
      }
    }
  }

  async getEmployeeDetails(id: string): Promise<ApiResponse<EmployeeDetails>> {
    try {
      const response = await fetch(`${BASE_URL}/api/employees/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      console.error("Get employee details error:", error);
      return {
        data: {} as EmployeeDetails,
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch employee details",
      };
    }
  }

  async createEmployee(employee: CreateEmployeeRequest | FormData): Promise<ApiResponse<Employee>> {
    try {
      const isFormData = employee instanceof FormData
      const response = await fetch(`${BASE_URL}/api/employees`, {
        method: "POST",
        headers: isFormData ? this.getAuthHeadersNoContentType() : this.getAuthHeaders(),
        body: isFormData ? employee : JSON.stringify(employee),
      })

      let responseText = await response.text(); // Always read as text first

      if (!response.ok) {
        console.error("Backend error during employee creation (non-OK response):", responseText);
        return {
          data: {} as Employee,
          success: false,
          message: responseText || `HTTP error! status: ${response.status}`,
        };
      }

      // If response is OK, try to parse as JSON if content type is json
      let data: Employee | {} = {};
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          data = JSON.parse(responseText); // Parse the text that was already read
        } catch (jsonParseError) {
          console.warn("Successful response, but failed to parse JSON:", jsonParseError, "Raw response:", responseText);
          data = {}; // Set data to empty object if JSON parsing fails
        }
      } else {
        console.warn("Successful response, but non-JSON content type. Raw response:", responseText);
        data = {}; // No JSON data to parse, treat as empty
      }

      return {
        data: data as Employee,
        success: true,
        message: "Employee added successfully.",
      };

    } catch (overallError) {
      console.error("Network or unexpected error during employee creation:", overallError);
      return {
        data: {} as Employee,
        success: false,
        message: overallError instanceof Error ? overallError.message : "An unexpected error occurred.",
      };
    }
  }

  async updateEmployee(id: number, employee: Partial<CreateEmployeeRequest> | FormData): Promise<ApiResponse<Employee>> {
    try {
      const isFormData = employee instanceof FormData
      const response = await fetch(`${BASE_URL}/api/employees/${id}`, {
        method: "PUT",
        headers: isFormData ? this.getAuthHeadersNoContentType() : this.getAuthHeaders(),
        body: isFormData ? employee : JSON.stringify(employee),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("Update employee error:", error)
      return {
        data: {} as Employee,
        success: false,
        message: error instanceof Error ? error.message : "Failed to update employee",
      }
    }
  }

  async deleteEmployee(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${BASE_URL}/api/employees/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return {
        data: undefined as void,
        success: true,
      }
    } catch (error) {
      console.error("Delete employee error:", error)
      return {
        data: undefined as void,
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete employee",
      }
    }
  }

  // Department endpoints
  async getDepartments(): Promise<ApiResponse<Department[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/departments`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("Get departments error:", error)
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch departments",
      }
    }
  }

  async createDepartment(department: { name: string; description?: string }): Promise<ApiResponse<Department>> {
    try {
      const response = await fetch(`${BASE_URL}/api/departments`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(department),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("Create department error:", error)
      return {
        data: {} as Department,
        success: false,
        message: error instanceof Error ? error.message : "Failed to create department",
      }
    }
  }

  async updateDepartment(
    id: number,
    department: { name: string; description?: string },
  ): Promise<ApiResponse<Department>> {
    try {
      const response = await fetch(`${BASE_URL}/api/departments/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(department),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("Update department error:", error)
      return {
        data: {} as Department,
        success: false,
        message: error instanceof Error ? error.message : "Failed to update department",
      }
    }
  }

  async deleteDepartment(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${BASE_URL}/api/departments/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return {
        data: undefined as void,
        success: true,
      }
    } catch (error) {
      console.error("Delete department error:", error)
      return {
        data: undefined as void,
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete department",
      }
    }
  }

  // Role endpoints
  async getRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/roles`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("Get roles error:", error)
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch roles",
      }
    }
  }

  async createRole(role: { name: string; description?: string }): Promise<ApiResponse<Role>> {
    try {
      const response = await fetch(`${BASE_URL}/api/roles`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(role),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("Create role error:", error)
      return {
        data: {} as Role,
        success: false,
        message: error instanceof Error ? error.message : "Failed to create role",
      }
    }
  }

  async updateRole(id: number, role: { name: string; description?: string }): Promise<ApiResponse<Role>> {
    try {
      const response = await fetch(`${BASE_URL}/api/roles/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(role),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("Update role error:", error)
      return {
        data: {} as Role,
        success: false,
        message: error instanceof Error ? error.message : "Failed to update role",
      }
    }
  }

  async deleteRole(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${BASE_URL}/api/roles/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return {
        data: undefined as void,
        success: true,
      }
    } catch (error) {
      console.error("Delete role error:", error)
      return {
        data: undefined as void,
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete role",
      }
    }
  }

  // LEAVE
  async applyLeave(leave: Omit<Leave, "id" | "status" | "requestDate"> & { status?: string; requestDate?: string }): Promise<ApiResponse<Leave>> {
    const payload = {
      ...leave,
      status: leave.status || "PENDING",
      requestDate: leave.requestDate || new Date().toISOString().slice(0, 10),
    };
    try {
      const response = await fetch(`${BASE_URL}/api/leave/apply`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: {} as Leave, success: false, message: error instanceof Error ? error.message : "Failed to apply leave" };
    }
  }

  async updateLeaveStatus(leaveId: string, status: string): Promise<ApiResponse<Leave>> {
    try {
      const response = await fetch(`${BASE_URL}/api/leave/${leaveId}/status?status=${status}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: {} as Leave, success: false, message: error instanceof Error ? error.message : "Failed to update leave status" };
    }
  }

  async getLeavesByHR(hrId: string): Promise<ApiResponse<Leave[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/leave/hr/${hrId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: [], success: false, message: error instanceof Error ? error.message : "Failed to fetch leaves by HR" };
    }
  }

  async getLeavesByEmployee(employeeId: string): Promise<ApiResponse<Leave[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/leave/employee/${employeeId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: [], success: false, message: error instanceof Error ? error.message : "Failed to fetch leaves by employee" };
    }
  }

  // HR
  async createHR(hr: Omit<HR, "id"> & { username: string; password: string }): Promise<ApiResponse<HR>> {
    try {
      const response = await fetch(`${BASE_URL}/api/hrs`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(hr),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: {} as HR, success: false, message: error instanceof Error ? error.message : "Failed to create HR" };
    }
  }

  async getHR(id: string): Promise<ApiResponse<HR>> {
    try {
      const response = await fetch(`${BASE_URL}/api/hrs/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: {} as HR, success: false, message: error instanceof Error ? error.message : "Failed to fetch HR" };
    }
  }

  async updateHR(id: string, hr: Partial<HR>): Promise<ApiResponse<HR>> {
    try {
      const response = await fetch(`${BASE_URL}/api/hrs/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(hr),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: {} as HR, success: false, message: error instanceof Error ? error.message : "Failed to update HR" };
    }
  }

  async deleteHR(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${BASE_URL}/api/hrs/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return { data: undefined as void, success: true };
    } catch (error) {
      return { data: undefined as void, success: false, message: error instanceof Error ? error.message : "Failed to delete HR" };
    }
  }

  async getAllHRs(): Promise<ApiResponse<HR[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/hrs`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: [], success: false, message: error instanceof Error ? error.message : "Failed to fetch HRs" };
    }
  }

  async getHRsByStatus(status: string): Promise<ApiResponse<HR[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/hrs/by-status/${status}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: [], success: false, message: error instanceof Error ? error.message : "Failed to fetch HRs by status" };
    }
  }

  async getHRsByAdmin(adminId: string): Promise<ApiResponse<HR[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/hrs/by-admin/${adminId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: [], success: false, message: error instanceof Error ? error.message : "Failed to fetch HRs by admin" };
    }
  }

  // ATTENDANCE
  async markAttendance(employeeId: string, status: string): Promise<ApiResponse<Attendance>> {
    try {
      const response = await fetch(`${BASE_URL}/api/attendance/${employeeId}/mark?status=${status}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: {} as Attendance, success: false, message: error instanceof Error ? error.message : "Failed to mark attendance" };
    }
  }

  async checkIn(employeeId: string, time: { hour: number; minute: number; second: number; nano: number }): Promise<ApiResponse<Attendance>> {
    try {
      const params = new URLSearchParams({
        hour: time.hour.toString(),
        minute: time.minute.toString(),
        second: time.second.toString(),
        nano: time.nano.toString(),
      });
      const response = await fetch(`${BASE_URL}/api/attendance/${employeeId}/checkin?${params.toString()}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: {} as Attendance, success: false, message: error instanceof Error ? error.message : "Failed to check in" };
    }
  }

  async checkOut(employeeId: string, time: { hour: number; minute: number; second: number; nano: number }): Promise<ApiResponse<Attendance>> {
    try {
      const params = new URLSearchParams({
        hour: time.hour.toString(),
        minute: time.minute.toString(),
        second: time.second.toString(),
        nano: time.nano.toString(),
      });
      const response = await fetch(`${BASE_URL}/api/attendance/${employeeId}/checkout?${params.toString()}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: {} as Attendance, success: false, message: error instanceof Error ? error.message : "Failed to check out" };
    }
  }

  async updateAttendance(attendanceId: string, attendance: Partial<Attendance>): Promise<ApiResponse<Attendance>> {
    try {
      const response = await fetch(`${BASE_URL}/api/attendance/${attendanceId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(attendance),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: {} as Attendance, success: false, message: error instanceof Error ? error.message : "Failed to update attendance" };
    }
  }

  async getAttendanceByEmployee(employeeId: string, date?: string): Promise<ApiResponse<Attendance[]>> {
    try {
      const url = date
        ? `${BASE_URL}/api/attendance/${employeeId}/report?date=${date}`
        : `${BASE_URL}/api/attendance/${employeeId}/report`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: [], success: false, message: error instanceof Error ? error.message : "Failed to fetch attendance" };
    }
  }

  async getSalary(employeeId: string, month: number, year: number): Promise<ApiResponse<number>> {
    try {
      const response = await fetch(`${BASE_URL}/api/attendance/${employeeId}/salary?month=${month}&year=${year}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: 0, success: false, message: error instanceof Error ? error.message : "Failed to fetch salary" };
    }
  }

  async getAttendanceByRange(startDate: string, endDate: string): Promise<ApiResponse<Attendance[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/attendance/range?startDate=${startDate}&endDate=${endDate}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return { data: [], success: false, message: error instanceof Error ? error.message : "Failed to fetch attendance by range" };
    }
  }

  async getAttendanceSummaryByEmployee(
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<AttendanceSummary>> {
    try {
      const response = await fetch(`${BASE_URL}/api/attendance/${employeeId}/summary?startDate=${startDate}&endDate=${endDate}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return {
        data: {} as AttendanceSummary,
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch attendance summary",
      };
    }
  }

  async getUserDetails(username: string): Promise<ApiResponse<UserDetails>> {
    try {
      const response = await fetch(`${BASE_URL}/api/users/details/${username}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      // Map backend fields to UserDetails interface
      const userDetails: UserDetails = {
        id: data.id,
        username: data.username || username,
        role: data.role || "",
        employeeId: data.employeeId,
        hrId: data.hrId,
        fullName: data.fullName,
        referredByAdminId: data.referredByAdminId,
      };
      console.log("Mapped user details:", userDetails);
      return { data: userDetails, success: true };
    } catch (error) {
      return { 
        data: {} as UserDetails, 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to fetch user details" 
      };
    }
  }

  async getEmployeesByHR(hrId: string): Promise<ApiResponse<Employee[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/employees/by-hr/${hrId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      console.error("Get employees by HR error:", error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch employees by HR",
      };
    }
  }

  // SALARY SLIP
  async generateSalarySlip(employeeId: string, month: number, year: number, incentive: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${BASE_URL}/api/salaryslip/generate/${employeeId}?month=${month}&year=${year}&incentive=${incentive}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return { data: undefined as void, success: true };
    } catch (error) {
      return { data: undefined as void, success: false, message: error instanceof Error ? error.message : "Failed to generate salary slip" };
    }
  }
}

export const apiService = new ApiService()
