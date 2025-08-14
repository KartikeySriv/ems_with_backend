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
  MapPin,
  CalendarDays,
  User,
  Building2,
  Briefcase,
  Download,
  Loader2,
  AlertCircle
} from "lucide-react"
import { apiService, type HR } from "@/services/api-service"

interface HRDetailsDialogProps {
  hrId: string | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const HRDetailsDialog: React.FC<HRDetailsDialogProps> = ({
  hrId,
  isOpen,
  onOpenChange,
}) => {
  const [hrDetails, setHRDetails] = useState<HR | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async () => {
    if (!hrId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await apiService.getHR(hrId)
      if (response.success && response.data) {
        setHRDetails(response.data)
      } else {
        setError(response.message || "Failed to fetch HR details")
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching details")
      console.error("Fetch HR details error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [hrId])

  useEffect(() => {
    if (isOpen && hrId) {
      fetchDetails()
    } else if (!isOpen) {
      // Clear data when dialog closes
      setHRDetails(null)
      setError(null)
    }
  }, [isOpen, hrId, fetchDetails])

  const renderField = (label: string, value: string | number | undefined | null, Icon: React.ElementType | null = null) => {
    if (!value) return null
    return (
      <div className="flex items-start text-sm">
        {Icon && <Icon className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />}
        <p>
          <span className="font-medium">{label}:</span>{" "}
          {String(value)}
        </p>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {hrDetails?.fullName || "HR Details"}
          </DialogTitle>
          <DialogDescription>Comprehensive information about the HR personnel.</DialogDescription>
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

        {!isLoading && !error && hrDetails && (
          <ScrollArea className="flex-grow pr-4">
            <div className="space-y-6 pb-6">

              {/* Personal Information */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <Separator />
                {renderField("Email", hrDetails.email, Mail)}
                {renderField("Phone Number", hrDetails.phoneNumber, Phone)}
                {renderField("Joining Date", hrDetails.joiningDate ? new Date(hrDetails.joiningDate).toLocaleDateString() : null, CalendarDays)}
                {renderField("Status", hrDetails.status, User)}
              </div>

              {/* Employment Information */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Employment Information</h3>
                <Separator />
                {renderField("Department", hrDetails.department, Building2)}
                {renderField("Referred By Admin ID", hrDetails.referredByAdminId, User)}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default HRDetailsDialog; 