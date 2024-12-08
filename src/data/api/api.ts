import { BASE_URL, EntityUrls } from '@/model/api/enums'
import type { FetchParams, IDataRepository } from '@/model/api/interfaces'
import type { ICoil, IFigure, IPrinter } from '@/model/interfaces'
import type { EntityType } from '@/model/types'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

export const fetchRequest = async <T>({
  url,
  method,
  data,
  params,
  headers,
}: FetchParams): Promise<T> => {
  const config: AxiosRequestConfig = {
    method,
    url: `${BASE_URL}${url}`,
    headers,
    params,
    data,
  }

  try {
    const response: AxiosResponse<T> = await axios(config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios error: ${error.response?.status} - ${error.message}`)
    } else {
      throw new Error(`Unknown error: ${error}`)
    }
  }
}

class ServerDataRepository<T extends EntityType> implements IDataRepository<T> {
  private typeName: keyof typeof EntityUrls

  constructor(typeName: keyof typeof EntityUrls) {
    this.typeName = typeName
  }

  private getEndpoint(): string {
    const endpoint = EntityUrls[this.typeName]
    if (!endpoint) {
      throw new Error(`No endpoint mapped for type ${this.typeName}`)
    }
    return endpoint
  }

  public async getData(): Promise<T[]> {
    const endpoint = this.getEndpoint()
    return await fetchRequest<T[]>({
      url: `/${endpoint}`,
      method: 'GET',
    })
  }

  public async postData(data: T): Promise<void> {
    const endpoint = this.getEndpoint()
    await fetchRequest<void>({
      url: `/${endpoint}`,
      method: 'POST',
      data,
    })
  }

  public async updateData(id: string, data: T): Promise<void> {
    const endpoint = this.getEndpoint()
    await fetchRequest<void>({
      url: `/${endpoint}/${id}`,
      method: 'PUT',
      data,
    })
  }

  public async deleteData(id: string): Promise<void> {
    const endpoint = this.getEndpoint()
    await fetchRequest<void>({
      url: `/${endpoint}/${id}`,
      method: 'DELETE',
    })
  }
}

class LocalDataRepository<T extends EntityType> implements IDataRepository<T> {
  private offlineKey: string

  constructor(offlineKey: string) {
    this.offlineKey = offlineKey
  }

  private getLocalStorageData(type: string): { synced: T[]; unsynced: T[] } {
    const data = localStorage.getItem(`${this.offlineKey}-${type}`)
    return data ? JSON.parse(data) : { synced: [], unsynced: [] }
  }

  private setLocalStorageData(type: string, data: { synced: T[]; unsynced: T[] }): void {
    localStorage.setItem(`${this.offlineKey}-${type}`, JSON.stringify(data))
  }

  public async getData(): Promise<T[]> {
    const localData = this.getLocalStorageData(this.offlineKey)
    return [...localData.synced, ...localData.unsynced]
  }

  public async postData(data: T): Promise<void> {
    const localData = this.getLocalStorageData(this.offlineKey)
    if (localData.unsynced.some((item) => item.id === data.id)) {
      return
    }
    this.setLocalStorageData(this.offlineKey, {
      synced: localData.synced,
      unsynced: [...localData.unsynced, data],
    })
  }

  public async updateData(id: string, data: T): Promise<void> {
    const localData = this.getLocalStorageData(this.offlineKey)
    this.setLocalStorageData(this.offlineKey, {
      synced: localData.synced,
      unsynced: localData.unsynced.map((item) => (item.id === id ? { ...item, ...data } : item)),
    })
  }

  public async deleteData(id: string): Promise<void> {
    const localData = this.getLocalStorageData(this.offlineKey)
    this.setLocalStorageData(this.offlineKey, {
      synced: localData.synced.filter((item) => item.id !== id),
      unsynced: localData.unsynced.filter((item) => item.id !== id),
    })
  }
}

export class DataService<T extends EntityType> implements IDataRepository<T> {
  private serverRepository: ServerDataRepository<T>
  private localRepository: LocalDataRepository<T>
  private isOnline: boolean = true

  constructor(typeName: keyof typeof EntityUrls, offlineKey: string) {
    this.serverRepository = new ServerDataRepository<T>(typeName)
    this.localRepository = new LocalDataRepository<T>(offlineKey)
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(BASE_URL)
      return response.ok
    } catch {
      return false
    }
  }

  private async ensureConnection(): Promise<void> {
    this.isOnline = await this.checkConnection()
  }

  public async getData(): Promise<T[]> {
    await this.ensureConnection()
    if (this.isOnline) {
      const data = await this.serverRepository.getData()
      for (const item of data) {
        await this.localRepository.postData(item)
      }
      return data
    } else {
      return await this.localRepository.getData()
    }
  }

  public async postData(data: T): Promise<void> {
    await this.ensureConnection()
    if (this.isOnline) {
      await this.serverRepository.postData(data)
    } else {
      await this.localRepository.postData(data)
    }
  }

  public async updateData(id: string, data: T): Promise<void> {
    await this.ensureConnection()
    if (this.isOnline) {
      await this.serverRepository.updateData(id, data)
    } else {
      await this.localRepository.updateData(id, data)
    }
  }

  public async deleteData(id: string): Promise<void> {
    await this.ensureConnection()
    if (this.isOnline) {
      await this.serverRepository.deleteData(id)
    } else {
      await this.localRepository.deleteData(id)
    }
  }
}

export const printersService = new DataService<IPrinter>('IPrinter', 'printer-offline')
export const coilsService = new DataService<ICoil>('ICoil', 'coil-offline')
export const figuresService = new DataService<IFigure>('IFigure', 'figure-offline')
