import type { FetchParams } from '@/model/api/interfaces'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

const BASE_URL = 'http://localhost:3000'

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
