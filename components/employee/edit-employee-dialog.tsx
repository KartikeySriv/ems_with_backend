import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const EditEmployeeDialog = ({ open, onOpenChange, employee, updateEmployee }) => {
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
    hrId: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
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

  useEffect(() => {
    if (open && employee) {
      setFormData({
        fullName: employee.fullName || "",
        email: employee.email || "",
        phoneNumber: employee.phoneNumber || "",
        whatsappNumber: employee.whatsappNumber || "",
        linkedInUrl: employee.linkedInUrl || "",
        currentAddress: employee.currentAddress || "",
        permanentAddress: employee.permanentAddress || "",
        collegeName: employee.collegeName || "",
        role: employee.role || "",
        department: employee.department || "",
        joiningDate: employee.joiningDate || "",
        internshipDuration: employee.internshipDuration?.toString() || "",
        salary: employee.salary?.toString() || "",
        hrId: employee.hrId || "",
      })
      // Clear file inputs on dialog open
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
    }
  }, [open, employee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = new FormData()
      form.append('fullName', formData.fullName)
      form.append('email', formData.email)
      form.append('phoneNumber', formData.phoneNumber)
      form.append('whatsappNumber', formData.whatsappNumber)
      form.append('linkedInUrl', formData.linkedInUrl)
      form.append('currentAddress', formData.currentAddress)
      form.append('permanentAddress', formData.permanentAddress)
      form.append('collegeName', formData.collegeName)
      form.append('role', formData.role)
      form.append('department', formData.department)
      form.append('joiningDate', formData.joiningDate)
      form.append('internshipDuration', formData.internshipDuration)
      form.append('salary', formData.salary)
      form.append('hrId', formData.hrId)
      if (photograph) form.append('photograph', photograph)
      if (tenthMarksheet) form.append('tenthMarksheet', tenthMarksheet);
      if (twelfthMarksheet) form.append('twelfthMarksheet', twelfthMarksheet);
      if (bachelorDegree) form.append('bachelorDegree', bachelorDegree);
      if (postgraduateDegree) form.append('postgraduateDegree', postgraduateDegree);
      if (aadharCard) form.append('aadharCard', aadharCard);
      if (panCard) form.append('panCard', panCard);
      if (pcc) form.append('pcc', pcc);
      if (resume) form.append('resume', resume);
      if (offerLetter) form.append('offerLetter', offerLetter);

      const success = await updateEmployee(employee.id, form)

      if (success) {
        onOpenChange(false)
      } else {
        alert("Failed to update employee. Please try again.")
      }
    } catch (error) {
      console.error("Error updating employee:", error)
      alert("An error occurred while updating the employee.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Update the details for the employee.</DialogDescription>
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
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
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
              <Label htmlFor="internshipDuration">Internship Duration (Optional)</Label>
              <Input
                id="internshipDuration"
                type="number"
                value={formData.internshipDuration}
                onChange={(e) => setFormData({ ...formData, internshipDuration: e.target.value })}
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
              <Label htmlFor="hrId">HR ID (Optional)</Label>
              <Input
                id="hrId"
                value={formData.hrId}
                onChange={(e) => setFormData({ ...formData, hrId: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="photograph">Photograph (Optional)</Label>
              <Input
                id="photograph"
                type="file"
                accept="image/*"
                onChange={e => setPhotograph(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="tenthMarksheet">10th Marksheet (Optional)</Label>
              <Input
                id="tenthMarksheet"
                type="file"
                accept="application/pdf"
                onChange={(e) => setTenthMarksheet(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="twelfthMarksheet">12th Marksheet (Optional)</Label>
              <Input
                id="twelfthMarksheet"
                type="file"
                accept="application/pdf"
                onChange={(e) => setTwelfthMarksheet(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="bachelorDegree">Bachelor Degree (Optional)</Label>
              <Input
                id="bachelorDegree"
                type="file"
                accept="application/pdf"
                onChange={(e) => setBachelorDegree(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="postgraduateDegree">Postgraduate Degree (Optional)</Label>
              <Input
                id="postgraduateDegree"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPostgraduateDegree(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="aadharCard">Aadhar Card (Optional)</Label>
              <Input
                id="aadharCard"
                type="file"
                accept="application/pdf"
                onChange={(e) => setAadharCard(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="panCard">PAN Card (Optional)</Label>
              <Input
                id="panCard"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPanCard(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="pcc">PCC (Police Clearance Certificate) (Optional)</Label>
              <Input
                id="pcc"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPcc(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="resume">Resume (Optional)</Label>
              <Input
                id="resume"
                type="file"
                accept="application/pdf"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="offerLetter">Offer Letter (Optional)</Label>
              <Input
                id="offerLetter"
                type="file"
                accept="application/pdf"
                onChange={(e) => setOfferLetter(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditEmployeeDialog 