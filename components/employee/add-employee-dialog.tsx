"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useEmployee } from "@/context/employee-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { CreateEmployeeJsonPayload } from "@/services/api-service"

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddEmployeeDialog({ open, onOpenChange }: AddEmployeeDialogProps) {
  const { addEmployee, /* departments, roles, */ fetchDepartments, fetchRoles } = useEmployee()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    whatsappNumber: "",
    linkedInUrl: "",
    currentAddress: "",
    permanentAddress: "",
    collegeName: "",
    role: "",
    department: "",
    joiningDate: "",
    internshipDuration: "",
    salary: "",
    username: "",
    password: "",
  })
  const [photograph, setPhotograph] = useState<File | null>(null)
  const [tenthMarksheet, setTenthMarksheet] = useState<File | null>(null);
  const [twelfthMarksheet, setTwelfthMarksheet] = useState<File | null>(null);
  const [bachelorDegree, setBachelorDegree] = useState<File | null>(null);
  const [postgraduateDegree, setPostgraduateDegree] = useState<File | null>(null);
  const [aadharCard, setAadharCard] = useState<File | null>(null);
  const [panCard, setPanCard] = useState<File | null>(null);
  const [pcc, setPcc] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [offerLetter, setOfferLetter] = useState<File | null>(null);

  const roles = [
    { id: 1, name: "lead executive" },
    { id: 2, name: "international sales executive" },
    { id: 3, name: "it" },
    { id: 4, name: "intern" },
  ];

  const departments = [
    { id: 1, name: "sales" },
    { id: 2, name: "it" },
  ];

  useEffect(() => {
    if (open) {
      // fetchDepartments()
      // fetchRoles()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = new FormData()

      const employeeJsonPayload: CreateEmployeeJsonPayload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        linkedInUrl: formData.linkedInUrl,
        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress,
        collegeName: formData.collegeName,
        role: formData.role,
        department: formData.department,
        joiningDate: new Date(formData.joiningDate).getTime(),
        internshipDuration: formData.internshipDuration ? parseInt(formData.internshipDuration) : undefined,
        salary: parseFloat(formData.salary),
        status: "ACTIVE",
        hrId: user?.hrId || user?.id || "",
      };

      form.append('employee', JSON.stringify(employeeJsonPayload));

      form.append('username', formData.username);
      form.append('password', formData.password);

      const referenceId = user?.hrId || user?.id;
      if (referenceId) {
        form.append('referenceId', referenceId);
      } else {
        alert("HR ID (referenceId) is missing. Cannot add employee.");
        setIsSubmitting(false);
        return;
      }

      if (photograph) form.append('photograph', photograph);
      if (tenthMarksheet) form.append('tenthMarksheet', tenthMarksheet);
      if (twelfthMarksheet) form.append('twelfthMarksheet', twelfthMarksheet);
      if (bachelorDegree) form.append('bachelorDegree', bachelorDegree);
      if (postgraduateDegree) form.append('postgraduateDegree', postgraduateDegree);
      if (aadharCard) form.append('aadharCard', aadharCard);
      if (panCard) form.append('panCard', panCard);
      if (pcc) form.append('pcc', pcc);
      if (resume) form.append('resume', resume);
      if (offerLetter) form.append('offerLetter', offerLetter);

      const success = await addEmployee(form)

      if (success) {
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          whatsappNumber: "",
          linkedInUrl: "",
          currentAddress: "",
          permanentAddress: "",
          collegeName: "",
          role: "",
          department: "",
          joiningDate: "",
          internshipDuration: "",
          salary: "",
          username: "",
          password: "",
        })
        setPhotograph(null);
        setTenthMarksheet(null);
        setTwelfthMarksheet(null);
        setBachelorDegree(null);
        setPostgraduateDegree(null);
        setAadharCard(null);
        setPanCard(null);
        setPcc(null);
        setResume(null);
        setOfferLetter(null);
        onOpenChange(false)
      } else {
        alert("Failed to add employee. Please try again.")
      }
    } catch (error) {
      console.error("Error adding employee:", error)
      alert("An error occurred while adding the employee.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Enter the details for the new employee.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
              <div>
              <Label htmlFor="fullName">Full Name</Label>
                <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="whatsappNumber">WhatsApp Number (Optional)</Label>
              <Input
                id="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="linkedInUrl">LinkedIn URL (Optional)</Label>
              <Input
                id="linkedInUrl"
                value={formData.linkedInUrl}
                onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="currentAddress">Current Address (Optional)</Label>
              <Input
                id="currentAddress"
                value={formData.currentAddress}
                onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="permanentAddress">Permanent Address (Optional)</Label>
              <Input
                id="permanentAddress"
                value={formData.permanentAddress}
                onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="collegeName">College Name (Optional)</Label>
              <Input
                id="collegeName"
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.name}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

              <div>
              <Label htmlFor="department">Department</Label>
                <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>

              <div>
              <Label htmlFor="joiningDate">Joining Date</Label>
                <Input
                id="joiningDate"
                  type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  required
                />
              </div>

            <div>
              <Label htmlFor="internshipDuration">Internship Duration</Label>
              <Input
                id="internshipDuration"
                type="number"
                value={formData.internshipDuration}
                onChange={(e) => setFormData({ ...formData, internshipDuration: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="photograph">Photograph</Label>
              <Input
                id="photograph"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setPhotograph(e.target.files?.[0] || null)}
                required
              />
            </div>

            <div>
              <Label htmlFor="tenthMarksheet">10th Marksheet  (PDF)</Label>
              <Input
                id="tenthMarksheet"
                type="file"
                accept="application/pdf"
                onChange={(e) => setTenthMarksheet(e.target.files?.[0] || null)}
                required
              />
            </div>

            <div>
              <Label htmlFor="twelfthMarksheet">12th Marksheet (PDF)</Label>
              <Input
                id="twelfthMarksheet"
                type="file"
                accept="application/pdf"
                onChange={(e) => setTwelfthMarksheet(e.target.files?.[0] || null)}
                required
              />
            </div>

            <div>
              <Label htmlFor="bachelorDegree">Bachelor Degree (PDF)</Label>
              <Input
                id="bachelorDegree"
                type="file"
                accept="application/pdf"
                onChange={(e) => setBachelorDegree(e.target.files?.[0] || null)}
                required
              />
            </div>

            <div>
              <Label htmlFor="postgraduateDegree">Postgraduate Degree (PDF)</Label>
              <Input
                id="postgraduateDegree"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPostgraduateDegree(e.target.files?.[0] || null)}
                required
              />
            </div>

            <div>
              <Label htmlFor="aadharCard">Aadhar Card (PDF)</Label>
              <Input
                id="aadharCard"
                type="file"
                accept="application/pdf"
                onChange={(e) => setAadharCard(e.target.files?.[0] || null)}
                required
              />
            </div>

            <div>
              <Label htmlFor="panCard">PAN Card (PDF)</Label>
              <Input
                id="panCard"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPanCard(e.target.files?.[0] || null)}
                required
              />
            </div>

            <div>
              <Label htmlFor="pcc">PCC (Police Clearance Certificate) (PDF)</Label>
              <Input
                id="pcc"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPcc(e.target.files?.[0] || null)}
                required
              />
            </div>

            <div>
              <Label htmlFor="resume">Resume (PDF)</Label>
              <Input
                id="resume"
                type="file"
                accept="application/pdf"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                required
              />
            </div>

            <div>
              <Label htmlFor="offerLetter">Offer Letter (PDF)</Label>
              <Input
                id="offerLetter"
                type="file"
                accept="application/pdf"
                onChange={(e) => setOfferLetter(e.target.files?.[0] || null)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
