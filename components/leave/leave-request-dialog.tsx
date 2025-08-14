"use client"

import type React from "react"

import { useState } from "react"
import { useEmployee } from "@/context/employee-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LeaveRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LeaveRequestDialog({ open, onOpenChange }: LeaveRequestDialogProps) {
  const { applyLeave } = useEmployee()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
    overrideAutoReject: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user && (user.id || user.employeeId)) {
      const isHR = user.role === "HR";
      await applyLeave({
        employeeId: isHR ? user.id : (user.employeeId || user.id),
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
        overrideAutoReject: formData.overrideAutoReject,
        status: "PENDING",
        requestDate: new Date().toISOString().split('T')[0],
        hrId: isHR ? user.referredByAdminId : user.hrId,
      })
      setFormData({
        fromDate: "",
        toDate: "",
        reason: "",
        overrideAutoReject: false,
      })
      onOpenChange(false)
    } else {
      alert("No user id found for this user.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
          <DialogDescription>Submit a new leave request for approval.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fromDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="fromDate"
                type="date"
                value={formData.fromDate}
                onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="toDate" className="text-right">
                End Date
              </Label>
              <Input
                id="toDate"
                type="date"
                value={formData.toDate}
                onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="col-span-3"
                placeholder="Please provide a reason for your leave request"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="overrideAutoReject" className="text-right">
                Override Auto Reject
              </Label>
              <Select
                onValueChange={(value) => setFormData({ ...formData, overrideAutoReject: value === "true" })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select override auto reject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
