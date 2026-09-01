export interface EmployeeDto {
  id: number
  employeeTypeId: number
  firstName: string
  lastName: string
  socialSecurityNumber: string
  departmentId: number | null
  createdDate: string
  updatedDate: string | null
}

export interface CreateEmployeeDto {
  employeeTypeId: number
  firstName: string
  lastName: string
  socialSecurityNumber: string
  departmentId: number | null
}

export interface EmployeeTypeDto {
  id: number
  name: string
}
