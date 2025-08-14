"use client"

import { useState, useEffect } from "react"
import { useEmployee } from "@/context/employee-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Trash2, Mail, Loader2, AlertCircle } from "lucide-react"
import AddEmployeeDialog from "./add-employee-dialog"
import EmployeeDetailsDialog from "./employee-details-dialog"

export default function EmployeeList() {
  const { employees, isLoading, error, deleteEmployee, fetchEmployees, fetchEmployeesByHR } = useEmployee()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (user?.role === "HR" && user?.id) {
      fetchEmployeesByHR(user.id);
    } else if (user?.role === "ADMIN" && user?.id) {
      // For admin, use the same method as the context to ensure consistency
      // Don't fetch here - let the context handle it
    } else if (user?.role && user.role !== "HR" && user.role !== "ADMIN") {
      fetchEmployees();
    }
  }, [user?.role, user?.id, fetchEmployees, fetchEmployeesByHR]);

  const filteredEmployees = employees.filter(
    (employee) => {
      const departmentName = typeof employee.department === 'object' && employee.department !== null
        ? employee.department.name
        : employee.department;
      const roleName = typeof employee.role === 'object' && employee.role !== null
        ? employee.role.name
        : employee.role;

      return (
        (employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roleName?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  )

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      setDeletingId(id)
      const success = await deleteEmployee(id)
      if (!success) {
        alert("Failed to delete employee. Please try again.")
      }
      setDeletingId(null)
    }
  }

  if (isLoading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employee Management</h2>
          <p className="text-muted-foreground">Manage your organization's employees</p>
        </div>
        {user?.role !== "ADMIN" && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchEmployees} className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No employees found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt={employee.fullName || "Employee"} />
                    <AvatarFallback>
                      {employee.fullName ? employee.fullName[0] : "E"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg cursor-pointer hover:underline"
                      onClick={() => {
                        setSelectedEmployeeId(String(employee.id))
                        setShowDetailsDialog(true)
                      }}
                    >
                      {employee.fullName || "No Name"}
                    </CardTitle>
                    <CardDescription>{typeof employee.role === 'object' && employee.role !== null ? employee.role.name : employee.role || "No Role"}</CardDescription>
                  </div>
                  <Badge variant={employee.status === "ACTIVE" ? "default" : "secondary"}>
                    {employee.status?.toLowerCase() || "unknown"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-2 h-4 w-4" />
                    {employee.email || "No Email"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Department:</span> {typeof employee.department === 'object' && employee.department !== null ? employee.department.name : employee.department || "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Salary:</span> ${employee.salary ? employee.salary.toLocaleString() : "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Joining Date:</span> {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "N/A"}
                  </div>
                  {employee.phoneNumber && (
                    <div className="text-sm">
                      <span className="font-medium">Phone:</span> {employee.phoneNumber}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(employee.id)}
                    disabled={deletingId === employee.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deletingId === employee.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddEmployeeDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <EmployeeDetailsDialog
        employeeId={selectedEmployeeId}
        isOpen={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </div>
  )
}
