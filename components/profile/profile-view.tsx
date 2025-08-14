"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Mail, Building, Calendar, DollarSign } from "lucide-react"

export default function ProfileView() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "",
    position: user?.position || "",
  })

  const handleSave = () => {
    updateUser(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      department: user?.department || "",
      position: user?.position || "",
    })
    setIsEditing(false)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">View and manage your personal information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.fullName} />
                <AvatarFallback className="text-lg">
                  {(user.fullName || "")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <Badge variant="secondary" className="mb-2">
                  {user.role.toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground">Employee ID: {user.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <span className="text-sm">{user.fullName}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                {isEditing ? (
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <Building className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user.department}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="position">Position</Label>
                {isEditing ? (
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center mt-1">
                    <span className="text-sm">{user.position}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your employment overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="text-sm">Years of Service</span>
                </div>
                <span className="font-medium">2.5 years</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                  <span className="text-sm">Leave Balance</span>
                </div>
                <span className="font-medium">15 days</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building className="mr-2 h-4 w-4 text-purple-600" />
                  <span className="text-sm">Reports To</span>
                </div>
                <span className="font-medium">Sarah Johnson</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Last Login:</span> Today, 9:15 AM
                </div>
                <div className="text-sm">
                  <span className="font-medium">Last Leave:</span> Dec 20-22, 2023
                </div>
                <div className="text-sm">
                  <span className="font-medium">Performance Review:</span> Due Jan 2024
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
