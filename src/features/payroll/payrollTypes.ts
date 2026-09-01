export interface PayrollRecordDto {
  id: number
  employeeId: number
  weekStartDate: string
  weekEndDate: string
  hoursWorked: number | null
  grossSales: number | null
  calculatedPay: number
  createdDate: string
}

export interface CreatePayrollRecordDto {
  employeeId: number
  weekStartDate: string
  weekEndDate: string
  hoursWorked: number | null
  grossSales: number | null
}

export interface EmployeePayDto {
  employeeId: number
  employeeType: string
  weeklyPay: number
}

export interface WeeklyReportItemDto {
  employeeId: number
  employeeName: string
  employeeType: string
  hoursWorked: number | null
  grossSales: number | null
  calculatedPay: number
}
