"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eye, Calendar, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { apiService } from "@/services/api-service"

export default function SalarySlips() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState("2024-01")
  const [isLoading, setIsLoading] = useState(false)

  // Ping backend every 5 minutes to prevent sleep
  useEffect(() => {
    const pingBackend = async () => {
      try {
        await fetch("https://employee-management-system-pahv.onrender.com/api/ping")
      } catch (error) {
        console.error("Ping error:", error)
      }
    }
    pingBackend()
    const interval = setInterval(pingBackend, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Mock salary data
  const salaryData = {
    basicSalary: 50000,
    allowances: {
      housing: 10000,
      transport: 3000,
      medical: 2000,
    },
    deductions: {
      tax: 8000,
      insurance: 1500,
      providentFund: 2500,
    },
  }

  const totalAllowances = Object.values(salaryData.allowances).reduce((sum, amount) => sum + amount, 0)
  const totalDeductions = Object.values(salaryData.deductions).reduce((sum, amount) => sum + amount, 0)
  const grossSalary = salaryData.basicSalary + totalAllowances
  const netSalary = grossSalary - totalDeductions

  // Remove the dropdown and calculate months up to last month
  const now = new Date()
  const months = []
  for (let i = 1; i <= 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    })
  }

  const handleDownload = async (month: string) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const url = `https://employee-management-system-pahv.onrender.com/api/salaryslip/download/${user.id}?month=${month}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Download failed:", errorText);
        throw new Error("Download failed");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `salary-slip-${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Salary Slips</h2>
          <p className="text-muted-foreground">View and download your salary statements</p>
        </div>
      <div className="grid gap-6">
        {/* Salary History */}
        <Card>
          <CardHeader>
            <CardTitle>Salary History</CardTitle>
            <CardDescription>Your recent salary statements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {months.map((month) => (
                <div
                  key={month.value}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{month.label}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(month.value)} disabled={isLoading}>
                      <Download className="h-4 w-4" />
                    </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
