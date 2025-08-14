"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEmployee } from "@/context/employee-context"
import { Users, FileText, TrendingUp, Award, Clock, DollarSign, BarChart3 } from "lucide-react"

export default function HRTools() {
  const { employees, leaves, attendance } = useEmployee()

  const hrMetrics = [
    {
      title: "Employee Retention",
      value: "94%",
      icon: TrendingUp,
      description: "Year over year",
      color: "text-green-600",
    },
    {
      title: "Average Tenure",
      value: "3.2 years",
      icon: Clock,
      description: "Company average",
      color: "text-blue-600",
    },
    {
      title: "Training Hours",
      value: "240h",
      icon: Award,
      description: "Per employee/year",
      color: "text-purple-600",
    },
    {
      title: "Satisfaction Score",
      value: "4.6/5",
      icon: BarChart3,
      description: "Latest survey",
      color: "text-orange-600",
    },
  ]

  const hrTools = [
    {
      title: "Performance Reviews",
      description: "Manage employee performance evaluations",
      icon: Award,
      action: "Manage Reviews",
    },
    {
      title: "Recruitment",
      description: "Post jobs and manage candidates",
      icon: Users,
      action: "View Openings",
    },
    {
      title: "Training Programs",
      description: "Organize employee development",
      icon: FileText,
      action: "Manage Training",
    },
    {
      title: "Policy Management",
      description: "Update company policies",
      icon: FileText,
      action: "View Policies",
    },
    {
      title: "Payroll Processing",
      description: "Process monthly payroll",
      icon: DollarSign,
      action: "Process Payroll",
    },
    {
      title: "Reports & Analytics",
      description: "Generate HR reports",
      icon: BarChart3,
      action: "View Reports",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">HR Tools</h2>
        <p className="text-muted-foreground">Human resources management and analytics</p>
      </div>

      {/* HR Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {hrMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Engineering</span>
                <span className="font-medium">12 employees</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Marketing</span>
                <span className="font-medium">8 employees</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Sales</span>
                <span className="font-medium">15 employees</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">HR</span>
                <span className="font-medium">4 employees</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leave Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pending Requests</span>
                <span className="font-medium text-orange-600">
                  {leaves.filter((l) => l.status === "pending").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Approved This Month</span>
                <span className="font-medium text-green-600">
                  {leaves.filter((l) => l.status === "approved").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Average Leave Days</span>
                <span className="font-medium">18 days/year</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Present Today</span>
                <span className="font-medium text-green-600">
                  {attendance.filter((a) => a.status === "present").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Late Arrivals</span>
                <span className="font-medium text-orange-600">
                  {attendance.filter((a) => a.status === "late").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Attendance Rate</span>
                <span className="font-medium">96.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HR Tools Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hrTools.map((tool, index) => {
          const Icon = tool.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">{tool.action}</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent HR Activities</CardTitle>
          <CardDescription>Latest HR actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Performance review completed for John Doe</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New policy document uploaded</p>
                <p className="text-xs text-muted-foreground">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Training session scheduled for next week</p>
                <p className="text-xs text-muted-foreground">6 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Payroll processed for December</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
