import { api, opResult } from '@/shared/api/client'
import type { OperationResult } from '@/shared/types/operationResult'

export interface DepartmentDto {
  id: number
  name: string
}

export interface CreateDepartmentDto {
  name: string
}

export function getDepartments(): Promise<OperationResult<DepartmentDto[]>> {
  return opResult(api.get<OperationResult<DepartmentDto[]>>('/Departments'))
}

export function createDepartment(
  payload: CreateDepartmentDto,
): Promise<OperationResult<DepartmentDto>> {
  return opResult(api.post<OperationResult<DepartmentDto>>('/Departments', payload))
}

export function updateDepartment(
  id: number,
  payload: CreateDepartmentDto,
): Promise<OperationResult<DepartmentDto>> {
  return opResult(api.put<OperationResult<DepartmentDto>>(`/Departments/${id}`, payload))
}

export function deleteDepartment(id: number): Promise<OperationResult<boolean>> {
  return opResult(api.delete<OperationResult<boolean>>(`/Departments/${id}`))
}
