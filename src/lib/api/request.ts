import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiEnvelope } from './types'

function normalizeBaseUrl(raw: string | undefined) {
  const value = (raw || '').trim().replace(/\/+$/, '')
  if (!value) return ''
  return /\/v1$/i.test(value) ? value : `${value}/v1`
}

export const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_ARTGURU_API_BASE_URL || process.env.NEXT_PUBLIC_IMGUPSCALER_API_BASE_URL)

export function getAuthToken() {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_IMGUPSCALER_API_TOKEN || null
  return window.localStorage.getItem('artguru-token') || window.localStorage.getItem('imgupscaler-token') || process.env.NEXT_PUBLIC_IMGUPSCALER_API_TOKEN || null
}

export function isApiEnabled() {
  return (process.env.NEXT_PUBLIC_ARTGURU_API_ENABLED === 'true' || process.env.NEXT_PUBLIC_IMGUPSCALER_API_ENABLED === 'true') && Boolean(API_BASE_URL) && Boolean(getAuthToken())
}

export class ApiError extends Error {
  status?: number
  code?: string | number
  constructor(message: string, status?: number, code?: string | number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function responseError(response: AxiosResponse<unknown>) {
  const body = response.data as ApiEnvelope<unknown> | undefined
  return new ApiError(body?.message || `API request failed (${response.status})`, response.status, body?.code)
}

function convertError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  const axiosError = error as AxiosError<ApiEnvelope<unknown>>
  return new ApiError(axiosError.response?.data?.message || axiosError.message || 'Network request failed', axiosError.response?.status, axiosError.response?.data?.code)
}

export const apiClient = axios.create({ baseURL: API_BASE_URL || undefined, timeout: 30_000, headers: { Accept: 'application/json' } })

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  config.headers.set('Accept', 'application/json')
  if (token) config.headers.set('Authorization', /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`)
  if (typeof window !== 'undefined') {
    config.headers.set('accept-domain', window.location.host)
    config.headers.set('lang', document.documentElement.lang || 'en')
    config.headers.set('accept-timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
  }
  return config
})

apiClient.interceptors.response.use((response) => {
  const body = response.data as ApiEnvelope<unknown> | undefined
  if (body && typeof body.code === 'number') {
    if (body.code !== 0) throw responseError(response)
    response.data = body.data
  }
  return response
}, (error) => Promise.reject(convertError(error)))

export async function get<T>(path: string, config?: AxiosRequestConfig) {
  return (await apiClient.get<T>(path, config)).data
}

export async function post<T>(path: string, body?: unknown, config?: AxiosRequestConfig) {
  return (await apiClient.post<T>(path, body, config)).data
}
