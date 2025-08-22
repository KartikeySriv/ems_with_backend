"use client"

import { useAuth } from "@/context/auth-context"
import { useEmployee } from "@/context/employee-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, CheckCircle, Loader2, Briefcase, UserCheck, Clock } from "lucide-react"

export default function DashboardOverview() {
  const { user } = useAuth()
  const { employees, isLoading, isLoadingHRs, hrs } = useEmployee()

  const averageSalaryValue = employees.length > 0
    ? Math.round(employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length)
    : 0;
    
  const averageSalaryFormatted = employees.length > 0
    ? (employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : "$0";

  const activeEmployees = employees.filter(emp => emp.status === "active").length;
  const inactiveEmployees = employees.filter(emp => emp.status === "inactive").length;

  const stats = [
    {
      title: user?.role === "EMPLOYEE" ? "Team Size" : "Total Employees",
      value: employees.length,
      icon: Users,
      description: user?.role === "ADMIN" 
        ? "All employees across all HRs" 
        : user?.role === "EMPLOYEE" 
          ? "Employees in your team"
          : "Active employees",
      color: "text-blue-600",
    },
  ];

  if (user?.role === "ADMIN") {
    stats.push(
      {
        title: "Total HRs",
        value: hrs.length,
        icon: UserCheck,
        description: "HR personnel managed",
        color: "text-green-600",
      },
      // {
      //   title: "Active Employees",
      //   value: activeEmployees,
      //   icon: CheckCircle,
      //   description: "Currently active employees",
      //   color: "text-green-600",
      // },
      // {
      //   title: "Inactive Employees",
      //   value: inactiveEmployees,
      //   icon: Clock,
      //   description: "Inactive employees",
      //   color: "text-orange-600",
      // }
    );
  } else if (user?.role === "HR") {
    stats.push({
      title: "Average Salary",
      value: averageSalaryValue,
      icon: DollarSign,
      description: "Average employee salary",
      color: "text-purple-600",
    });
  }

  const recentActivities = [
    { action: "Employee data loaded from backend", time: "Just now" },
    { action: "Connected to Render API successfully", time: "1 minute ago" },
    { action: "Dashboard initialized", time: "2 minutes ago" },
  ]

  const shouldShowLoading = user?.role === "ADMIN" 
    ? (isLoading || isLoadingHRs) || (employees.length === 0 || hrs.length === 0)
    : isLoading && employees.length === 0;

  // Show loading state for admin users until both data sets are loaded
  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {user?.role === "ADMIN" 
              ? "Loading admin dashboard data..."
              : "Loading dashboard data..."
            }
          </p>
          {user?.role === "ADMIN" && (
            <p className="text-sm text-gray-500 mt-2">
              {isLoading && isLoadingHRs ? "Loading employees and HRs..." :
               isLoading ? "Loading employees..." :
               isLoadingHRs ? "Loading HRs..." :
               "Preparing dashboard..."}
            </p>
          )}
          {user?.role === "ADMIN" && (
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <span>Employees:</span>
                {isLoading ? (
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
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.fullName || user?.username || "!"}</h2>
          <p className="text-muted-foreground">
            {user?.role === "ADMIN" 
              ? "Here's what's happening with all employees across all HRs today."
              : user?.role === "HR"
                ? "Here's what's happening with your managed employees today."
                : user?.role === "EMPLOYEE"
                  ? "Here's what's happening with your team today."
                  : "Here's what's happening with your team today."
            }
          </p>
        </div>
        {/* {user?.role === "ADMIN" && (
          <Button 
            onClick={() => {
              // This will trigger a refresh through the context
              window.location.reload();
            }}
            variant="outline"
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        )} */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {user?.role === "ADMIN" ? (
              <>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Manage All Employees</div>
                  <div className="text-sm text-muted-foreground">View and manage all employees across all HRs</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">HR Management</div>
                  <div className="text-sm text-muted-foreground">Manage HR accounts and permissions</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Attendance Overview</div>
                  <div className="text-sm text-muted-foreground">Mark attendance for all employees</div>
                </button>
              </>
            ) : user?.role === "HR" ? (
              <>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Add New Employee</div>
                  <div className="text-sm text-muted-foreground">Create a new employee record</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Manage My Employees</div>
                  <div className="text-sm text-muted-foreground">View and manage your employees</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Attendance Management</div>
                  <div className="text-sm text-muted-foreground">Manage attendance for your employees</div>
                </button>
              </>
            ) : (
              <>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">View My Profile</div>
                  <div className="text-sm text-muted-foreground">Update your personal information</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Team Directory</div>
                  <div className="text-sm text-muted-foreground">View your team members</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Leave Requests</div>
                  <div className="text-sm text-muted-foreground">Submit and track leave requests</div>
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Overview removed because departments are not available */}
    </div>
  )
}
