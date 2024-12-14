import { CustomError } from '@/model/error/customError'

export function useErrorHandling() {
  const throwIf = (condition: boolean, message: string) => {
    if (condition) throw new CustomError(message)
  }

  const throwCustomError = (message: string) => {
    throw new CustomError(message)
  }

  return { throwIf, throwCustomError }
}
