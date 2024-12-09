export class CustomError extends Error {
  status: 'error' | 'success' | 'warning'

  constructor(message: string, status: 'error' | 'success' | 'warning' = 'error') {
    super(message)
    this.name = 'CustomError'
    this.status = status
  }
}

