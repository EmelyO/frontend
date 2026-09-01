import { api, opResult } from '@/shared/api/client'
import type { OperationResult } from '@/shared/types/operationResult'
import type {
  CreateEmployeeDto,
  EmployeeDto,
  EmployeeTypeDto,
} from '@/features/employees/employeeTypes'
import type { EmployeeTypeDef } from '@/features/employees/employeeTypeRegistry'

export function getEmployees(): Promise<OperationResult<EmployeeDto[]>> {
  return opResult(api.get<OperationResult<EmployeeDto[]>>('/Employees'))
}

export function getEmployee(id: number): Promise<OperationResult<EmployeeDto>> {
  return opResult(api.get<OperationResult<EmployeeDto>>(`/Employees/${id}`))
}

export function createEmployee(payload: CreateEmployeeDto): Promise<OperationResult<EmployeeDto>> {
  return opResult(api.post<OperationResult<EmployeeDto>>('/Employees', payload))
}

export function updateEmployee(
  id: number,
  payload: CreateEmployeeDto,
): Promise<OperationResult<EmployeeDto>> {
  return opResult(api.put<OperationResult<EmployeeDto>>(`/Employees/${id}`, payload))
}

export function deleteEmployee(id: number): Promise<OperationResult<EmployeeDto>> {
  return opResult(api.delete<OperationResult<EmployeeDto>>(`/Employees/${id}`))
}

export function getEmployeeTypes(): Promise<OperationResult<EmployeeTypeDto[]>> {
  return opResult(api.get<OperationResult<EmployeeTypeDto[]>>('/EmployeeTypes'))
}

export function getRate(
  def: EmployeeTypeDef,
  employeeId: number,
): Promise<OperationResult<Record<string, unknown>>> {
  return opResult(
    api.get<OperationResult<Record<string, unknown>>>(`${def.subtypePath}/${employeeId}`),
  )
}

export function createRate(
  def: EmployeeTypeDef,
  employeeId: number,
  rate: Record<string, number>,
): Promise<OperationResult<unknown>> {
  return opResult(
    api.post<OperationResult<unknown>>(def.subtypePath, def.toCreateBody(employeeId, rate)),
  )
}

export function updateRate(
  def: EmployeeTypeDef,
  employeeId: number,
  rate: Record<string, number>,
): Promise<OperationResult<unknown>> {
  return opResult(
    api.put<OperationResult<unknown>>(`${def.subtypePath}/${employeeId}`, def.toUpdateBody(rate)),
  )
}
