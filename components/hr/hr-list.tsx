"use client"

import { useState, useEffect, useCallback } from "react"
import { useEmployee } from "@/context/employee-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Trash2, Mail, Loader2, AlertCircle } from "lucide-react"
import AddHRDialog from "./add-hr-dialog"
import HRDetailsDialog from "./hr-details-dialog"

export default function HRList() {
  const { hrs, isLoading, error, fetchAllHRs, deleteHR, fetchHRsByAdmin } = useEmployee()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddHRDialog, setShowAddHRDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedHRId, setSelectedHRId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleHRAAdded = useCallback(() => {
    if (user?.role === "ADMIN" && user?.id) {
      fetchHRsByAdmin(user.id);
    }
  }, [user?.role, user?.id, fetchHRsByAdmin]);

  useEffect(() => {
    if (user?.role === "ADMIN" && user?.id) {
        fetchHRsByAdmin(user.id);
    }
  }, [user?.role, user?.id, fetchAllHRs, fetchHRsByAdmin])

  const filteredHRs = hrs.filter(
    (hr) =>
      hr.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hr.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hr.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this HR?")) {
      setDeletingId(id)
      const success = await deleteHR(id)
      if (!success) {
        alert("Failed to delete HR. Please try again.")
      }
      setDeletingId(null)
    }
  }

  if (isLoading && hrs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading HRs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">HR Management</h2>
          <p className="text-muted-foreground">Manage your organization\'s HR personnel</p>
        </div>
        <Button onClick={() => setShowAddHRDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add HR
        </Button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchAllHRs} className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search HRs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredHRs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500\">No HRs found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredHRs.map((hr) => (
            <Card key={hr.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt={hr.fullName || "HR"} />
                    <AvatarFallback>
                      {hr.fullName ? hr.fullName[0] : "H"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg cursor-pointer hover:underline"
                      onClick={() => {
                        setSelectedHRId(hr.id)
                        setShowDetailsDialog(true)
                      }}
                    >
                      {hr.fullName || "No Name"}
                    </CardTitle>
                    <CardDescription>{hr.department || "No Department"}</CardDescription>
                  </div>
                  <Badge variant={hr.status === "ACTIVE" ? "default" : "secondary"}>
                    {hr.status?.toLowerCase() || "unknown"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-2 h-4 w-4" />
                    {hr.email || "No Email"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Phone:</span> {hr.phoneNumber || "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Joining Date:</span> {hr.joiningDate ? new Date(hr.joiningDate).toLocaleDateString() : "N/A"}
                  </div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(hr.id)}
                    disabled={deletingId === hr.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deletingId === hr.id ? (
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

      <AddHRDialog open={showAddHRDialog} onOpenChange={setShowAddHRDialog} onSuccess={handleHRAAdded} />
      <HRDetailsDialog hrId={selectedHRId} isOpen={showDetailsDialog} onOpenChange={setShowDetailsDialog} />
    </div>
  )
} 