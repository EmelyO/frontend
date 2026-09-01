export interface OperationResult<T> {
  isSuccess: boolean
  message: string
  data: T | null
}
