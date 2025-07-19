import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api" // Default Laravel API URL

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

interface RequestOptions extends RequestInit {
  method?: HttpMethod
  body?: Record<string, any>
  token?: string
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers, ...rest } = options

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`
  } else {
    const storedToken = Cookies.get("authToken")
    if (storedToken) {
      defaultHeaders["Authorization"] = `Bearer ${storedToken}`
    }
  }

  const config: RequestInit = {
    method,
    headers: { ...defaultHeaders, ...headers },
    ...rest,
  }

  if (body && method !== "GET") {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(errorData.message || "An error occurred")
  }

  // Handle cases where the response might be empty (e.g., DELETE requests)
  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return null as T // Or handle as appropriate for your API
  }

  return response.json()
}
