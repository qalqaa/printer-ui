import type { RequestMethod } from './types'

export interface FetchParams {
  url: string
  method: RequestMethod
  data?: unknown
  params?: unknown
  headers?: Record<string, string>
}
