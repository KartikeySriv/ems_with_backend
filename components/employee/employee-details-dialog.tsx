"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Phone,
  Linkedin,
  MapPin,
  CalendarDays,
  DollarSign,
  GraduationCap,
  FileText,
  Paperclip,
  User,
  Building2,
  Briefcase,
  ExternalLink,
  Download,
  Loader2,
  Clock,
  AlertCircle
} from "lucide-react"
import { apiService, type EmployeeDetails } from "@/services/api-service"

interface EmployeeDetailsDialogProps {
  employeeId: string | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const EmployeeDetailsDialog: React.FC<EmployeeDetailsDialogProps> = ({
  employeeId,
  isOpen,
  onOpenChange,
}) => {
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async () => {
    if (!employeeId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await apiService.getEmployeeDetails(employeeId)
      if (response.success && response.data) {
        setEmployeeDetails(response.data)
      } else {
        setError(response.message || "Failed to fetch employee details")
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching details")
      console.error("Fetch employee details error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [employeeId])

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchDetails()
    } else if (!isOpen) {
      // Clear data when dialog closes
      setEmployeeDetails(null)
      setError(null)
    }
  }, [isOpen, employeeId, fetchDetails])

  const renderField = (label: string, value: string | number | undefined | null, Icon: React.ElementType | null = null, link: boolean = false) => {
    if (!value) return null
    return (
      <div className="flex items-start text-sm">
        {Icon && <Icon className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />}
        <p>
          <span className="font-medium">{label}:</span>{" "}
          {link ? (
            <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
              {String(value)} <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          ) : (
            String(value)
          )}
        </p>
      </div>
    )
  }

  const renderFileLink = (label: string, fileBase64: string | undefined | null, fileName: string) => {
    if (!fileBase64 || fileBase64.length === 0) {
      return (
        <div className="flex items-start text-sm">
          <FileText className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <p>
            <span className="font-medium">{label}:</span> No document available
          </p>
        </div>
      );
    }

    // Assume PDF as default extension for documents since the backend sends raw base64
    const fileExtension = 'pdf'; 
    const getMimeType = (ext: string) => {
      switch (ext.toLowerCase()) {
        case 'pdf': return 'application/pdf';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        default: return 'application/octet-stream';
      }
    };

    const mimeType = getMimeType(fileExtension);
    const dataUrl = `data:${mimeType};base64,${fileBase64}`;

    console.log(`Debug: Preparing download for ${fileName}.pdf`);
    console.log(`Debug: dataUrl prefix: ${dataUrl.substring(0, 100)}...`);

    return (
      <div className="flex items-start text-sm">
        <FileText className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-medium">{label}:</span>{" "}
          <a
            href={dataUrl}
            download={`${fileName}.pdf`}
            className="text-blue-600 hover:underline flex items-center"
          >
            Download {label} <Download className="ml-1 h-3 w-3" />
          </a>
        </p>
      </div>
    )
  }

  const renderPhotograph = (photoBase64: string | undefined | null) => {
    if (!photoBase64 || photoBase64.length === 0) {
      return (
        <div className="flex items-start text-sm">
          <FileText className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <p>
            <span className="font-medium">Photograph:</span> No document available
          </p>
        </div>
      );
    }
    const imageUrl = `data:image/jpeg;base64,${photoBase64}`;
    return (
      <div className="flex items-start text-sm">
        <FileText className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-medium">Photograph:</span>{" "}
          <a
            href={imageUrl}
            download="employee_photograph.jpeg"
            className="text-blue-600 hover:underline flex items-center"
          >
            Download Photograph <Download className="ml-1 h-3 w-3" />
          </a>
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {employeeDetails?.fullName || "Employee Details"}
          </DialogTitle>
          <DialogDescription>Comprehensive information about the employee.</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center flex-grow">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <p className="mt-2 text-gray-600">Loading details...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center flex-grow text-red-600">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>{error}</p>
            <Button onClick={fetchDetails} className="mt-4">Retry</Button>
          </div>
        )}

        {!isLoading && !error && employeeDetails && (
          <ScrollArea className="flex-grow pr-4">
            <div className="space-y-6 pb-6">
              {renderPhotograph(employeeDetails.photograph as unknown as string)}

              {/* Personal Information */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <Separator />
                {renderField("Email", employeeDetails.email, Mail)}
                {renderField("Phone Number", employeeDetails.phoneNumber, Phone)}
                {renderField("WhatsApp Number", employeeDetails.whatsappNumber, Phone)}
                {renderField("LinkedIn", employeeDetails.linkedInUrl, Linkedin, true)}
                {renderField("Current Address", employeeDetails.currentAddress, MapPin)}
                {renderField("Permanent Address", employeeDetails.permanentAddress, MapPin)}
                {renderField("Date of Birth", employeeDetails.dateOfBirth ? new Date(employeeDetails.dateOfBirth).toLocaleDateString() : null, CalendarDays)}
              </div>

              {/* Employment Information */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Employment Information</h3>
                <Separator />
                {renderField("Role", employeeDetails.role as string, Briefcase)}
                {renderField("Department", employeeDetails.department as string, Building2)}
                {renderField("Joining Date", employeeDetails.joiningDate ? new Date(employeeDetails.joiningDate).toLocaleDateString() : null, CalendarDays)}
                {renderField("Internship Duration", employeeDetails.internshipDuration ? `${employeeDetails.internshipDuration} months` : null, Clock)}
                {renderField("Salary", employeeDetails.salary ? `$${employeeDetails.salary.toLocaleString()}` : null, DollarSign)}
                {renderField("Status", employeeDetails.status, User)}
                {renderField("HR ID", employeeDetails.hrId, User)}
              </div>

              {/* Educational Documents */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Educational Documents</h3>
                <Separator />
                {renderField("College Name", employeeDetails.collegeName, GraduationCap)}
                {renderFileLink("Tenth Marksheet", employeeDetails.tenthMarksheet as unknown as string, "tenth_marksheet")}
                {renderFileLink("Twelfth Marksheet", employeeDetails.twelfthMarksheet as unknown as string, "twelfth_marksheet")}
                {renderFileLink("Bachelor Degree", employeeDetails.bachelorDegree as unknown as string, "bachelor_degree")}
                {renderFileLink("Postgraduate Degree", employeeDetails.postgraduateDegree as unknown as string, "postgraduate_degree")}
              </div>

              {/* Identity & Other Documents */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Identity & Other Documents</h3>
                <Separator />
                {renderFileLink("Aadhar Card", employeeDetails.aadharCard as unknown as string, "aadhar_card")}
                {renderFileLink("PAN Card", employeeDetails.panCard as unknown as string, "pan_card")}
                {renderFileLink("PCC (Police Clearance Certificate)", employeeDetails.pcc as unknown as string, "pcc")}
                {renderFileLink("Resume", employeeDetails.resume as unknown as string, "resume")}
                {renderFileLink("Offer Letter", employeeDetails.offerLetter as unknown as string, "offer_letter")}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EmployeeDetailsDialog