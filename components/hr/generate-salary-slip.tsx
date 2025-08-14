import React, { useState, useEffect, useCallback } from "react";
import { useEmployee } from "@/context/employee-context";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, DollarSign, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function GenerateSalarySlip() {
  const { user } = useAuth();
  const { employees, fetchEmployeesByHR, fetchEmployeesByAdminHRs, isLoading: employeesLoading, error: employeesError, generateSalarySlip } = useEmployee();

  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "MM"));
  const [selectedYear, setSelectedYear] = useState<string>(format(new Date(), "yyyy"));
  const [incentive, setIncentive] = useState<{[key: string]: number}>({});
  const [isGenerating, setIsGenerating] = useState<{[key: string]: boolean}>({});
  // const [salarySlipStatus, setSalarySlipStatus] = useState<{[key: string]: 'GENERATED' | 'NOT_GENERATED' | 'CHECKING'}>({});

  useEffect(() => {
    if (user?.role === "HR" && user?.id) {
      fetchEmployeesByHR(user.id);
    } else if (user?.role === "ADMIN" && user?.id) {
      fetchEmployeesByAdminHRs(user.id);
    } 
  }, [user?.role, user?.id, fetchEmployeesByHR, fetchEmployeesByAdminHRs]);

  const handleGenerate = useCallback(async (employeeId: string) => {
    setIsGenerating(prev => ({ ...prev, [employeeId]: true }));
    try {
      const monthAsNumber = parseInt(selectedMonth, 10);
      const yearAsNumber = parseInt(selectedYear, 10);
      const employeeIncentive = incentive[employeeId] || 0;

      const success = await generateSalarySlip(employeeId, monthAsNumber, yearAsNumber, employeeIncentive);
      if (success) {
        alert(`Salary slip for ${employeeId} (${format(new Date(yearAsNumber, monthAsNumber - 1), "MMM yyyy")}) generated successfully!`);
        // setSalarySlipStatus(prev => ({ ...prev, [employeeId]: 'GENERATED' })); // Removed status update
      } else {
        alert(`Failed to generate salary slip for ${employeeId}.`);
      }
    } catch (err) {
      console.error("Error generating salary slip:", err);
      alert("An unexpected error occurred while generating salary slip.");
    } finally {
      setIsGenerating(prev => ({ ...prev, [employeeId]: false }));
    }
  }, [selectedMonth, selectedYear, incentive, generateSalarySlip]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i)); // Current year and 4 previous years

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'), // 01 for January, 02 for February, etc.
    label: format(new Date(currentYear, i, 1), "MMMM"),
  }));

  if (employeesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (employeesError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Error loading employees: {employeesError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Generate Salary Slips</h2>
        <p className="text-muted-foreground">Generate monthly salary slips for your employees.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Period</CardTitle>
          <CardDescription>Choose the month and year for which to generate salary slips.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="month-select">Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month-select">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="year-select">Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>Generate salary slips for individual employees.</CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <p className="text-gray-500">No employees found for this HR.</p>
          ) : (
            <div className="grid gap-4">
              {employees.map(employee => (
                <div key={employee.id} className="flex flex-col md:flex-row items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-2 md:mb-0">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt={employee.fullName || "Employee"} />
                      <AvatarFallback>{employee.fullName ? employee.fullName[0] : "E"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.fullName}</p>
                      <p className="text-sm text-muted-foreground">{(typeof employee.role === 'object' && employee.role !== null) ? employee.role.name : employee.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    {/* Removed salarySlipStatus display */}
                    <Label htmlFor={`incentive-${employee.id}`} className="sr-only">Incentive</Label>
                    <Input
                      id={`incentive-${employee.id}`}
                      type="number"
                      placeholder="Incentive"
                      value={incentive[String(employee.id)] || ""}
                      onChange={(e) => setIncentive(prev => ({ ...prev, [String(employee.id)]: parseFloat(e.target.value) || 0 }))}
                      className="w-24"
                    />
                    <Button
                      onClick={() => handleGenerate(String(employee.id))}
                      disabled={isGenerating[String(employee.id)]}
                      className="w-full md:w-auto"
                    >
                      {isGenerating[String(employee.id)] ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Generate Slip
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 