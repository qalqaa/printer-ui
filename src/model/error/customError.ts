export class CustomError extends Error {
  status: 'error' | 'success' | 'warning'

  constructor(message: string, status: 'error' | 'success' | 'warning' = 'error') {
    super(message) // Важно: super() должен быть вызван первым
    this.name = 'CustomError'
    this.status = status

    // Это необходимо для совместимости с транспилером TypeScript
    Object.setPrototypeOf(this, CustomError.prototype)
  }
}

type ErrorDetails = {
  type?: 'thread' | 'nozzle' | 'electricity'
  progress?: number
  [key: string]: unknown
}

export class SimulateError extends Error {
  public name: string
  public details: ErrorDetails

  constructor(message: string, details: ErrorDetails = {}) {
    super(message)
    this.name = 'SimulateError'
    this.details = details

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }
  }

  get type(): 'thread' | 'nozzle' | 'electricity' | null {
    return this.details?.type || null
  }

  get progress(): number | null {
    return this.details?.progress ?? null
  }
}
