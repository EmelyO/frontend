import { api, opResult } from '@/shared/api/client'
import type { OperationResult } from '@/shared/types/operationResult'
import type {
  CreatePayrollRecordDto,
  EmployeePayDto,
  PayrollRecordDto,
  WeeklyReportItemDto,
} from '@/features/payroll/payrollTypes'

export function getEmployeePay(employeeId: number): Promise<OperationResult<EmployeePayDto>> {
  return opResult(api.get<OperationResult<EmployeePayDto>>(`/Employees/${employeeId}/pay`))
}

export function getPayrollHistory(
  employeeId: number,
): Promise<OperationResult<PayrollRecordDto[]>> {
  return opResult(api.get<OperationResult<PayrollRecordDto[]>>(`/PayrollRecords/${employeeId}`))
}

export function createPayrollRecord(
  payload: CreatePayrollRecordDto,
): Promise<OperationResult<PayrollRecordDto>> {
  return opResult(api.post<OperationResult<PayrollRecordDto>>('/PayrollRecords', payload))
}

export function getWeeklyReport(
  weekStartDate: string,
): Promise<OperationResult<WeeklyReportItemDto[]>> {
  return opResult(
    api.get<OperationResult<WeeklyReportItemDto[]>>('/PayrollRecords/report', {
      params: { weekStartDate },
    }),
  )
}
