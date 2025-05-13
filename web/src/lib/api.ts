/**
 * API utility functions for making requests to the backend
 */

// Base URL for API requests - would come from environment variables in a real app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns The response data
 */
async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * GET request
 * @param endpoint - API endpoint (without base URL)
 * @param params - Query parameters
 * @returns The response data
 */
export async function get<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  return fetchWithErrorHandling<T>(url);
}

/**
 * POST request
 * @param endpoint - API endpoint (without base URL)
 * @param data - Request body data
 * @returns The response data
 */
export async function post<T>(endpoint: string, data: any): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  return fetchWithErrorHandling<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 * @param endpoint - API endpoint (without base URL)
 * @param data - Request body data
 * @returns The response data
 */
export async function put<T>(endpoint: string, data: any): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  return fetchWithErrorHandling<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 * @param endpoint - API endpoint (without base URL)
 * @returns The response data
 */
export async function del<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  return fetchWithErrorHandling<T>(url, {
    method: 'DELETE',
  });
}
