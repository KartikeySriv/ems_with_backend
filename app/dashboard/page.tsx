import { LeaveRequestBox } from "@/components/leave-request-box"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LeaveRequestBox />
        {/* Add other dashboard components here */}
      </div>
    </div>
  )
} 