import type { RequestMethod } from './types'

interface FetchParams {
  url: string
  method: RequestMethod
  data?: unknown
  params?: unknown
  headers?: Record<string, string>
}

interface IDataRepository<T> {
  getData(): Promise<T[]>
  postData(data: T): Promise<void>
  updateData(id: string, data: T): Promise<void>
  deleteData(id: string): Promise<void>
}

export type { FetchParams, IDataRepository }
