import { api, opResult } from '@/shared/api/client'
import type { OperationResult } from '@/shared/types/operationResult'

export interface UserDto {
  id: number
  username: string
  roleId: number
  createdDate: string
  updatedDate: string | null
}

export interface CreateUserDto {
  username: string
  password: string
  roleId: number
}

export interface RoleDto {
  id: number
  name: string
}

export function getUsers(): Promise<OperationResult<UserDto[]>> {
  return opResult(api.get<OperationResult<UserDto[]>>('/Users'))
}

export function getUser(id: number): Promise<OperationResult<UserDto>> {
  return opResult(api.get<OperationResult<UserDto>>(`/Users/${id}`))
}

export function createUser(payload: CreateUserDto): Promise<OperationResult<UserDto>> {
  return opResult(api.post<OperationResult<UserDto>>('/Users', payload))
}

export function getRoles(): Promise<OperationResult<RoleDto[]>> {
  return opResult(api.get<OperationResult<RoleDto[]>>('/Roles'))
}
