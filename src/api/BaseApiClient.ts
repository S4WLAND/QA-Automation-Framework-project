import { Logger } from '@utils/Logger';

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers: Record<string, string>;
  success: boolean;
  message?: string;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  timeout?: number;
}

export class BaseApiClient {
  protected baseURL: string;
  protected defaultHeaders: Record<string, string>;
  protected logger: Logger;
  protected timeout: number;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...defaultHeaders
    };
    this.logger = new Logger('ApiClient');
    this.timeout = 30000; // 30 seconds default timeout
  }

  /**
   * Make HTTP request
   */
  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    this.logger.info(`[${requestId}] API Request`, {
      method: config.method,
      url: config.url,
      headers: this.sanitizeHeaders(config.headers || {}),
      params: config.params
    });

    try {
      const url = this.buildUrl(config.url, config.params);
      const headers = { ...this.defaultHeaders, ...config.headers };
      
      const requestOptions: RequestInit = {
        method: config.method,
        headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal: AbortSignal.timeout(config.timeout || this.timeout)
      };

      const response = await fetch(url, requestOptions);
      const responseTime = Date.now() - startTime;
      
      let responseData: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text() as any;
      }

      const apiResponse: ApiResponse<T> = {
        status: response.status,
        data: responseData,
        headers: this.parseHeaders(response.headers),
        success: response.ok,
        message: response.ok ? 'Request successful' : 'Request failed'
      };

      this.logger.info(`[${requestId}] API Response`, {
        status: response.status,
        success: response.ok,
        responseTime: `${responseTime}ms`,
        dataSize: JSON.stringify(responseData).length
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return apiResponse;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.logger.error(`[${requestId}] API Request Failed`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: `${responseTime}ms`,
        method: config.method,
        url: config.url
      });

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      headers
    });
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      headers
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      headers
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      headers
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      headers
    });
  }

  /**
   * Set authorization header
   */
  setAuth(token: string, type: 'Bearer' | 'Basic' | 'ApiKey' = 'Bearer'): void {
    this.defaultHeaders['Authorization'] = `${type} ${token}`;
  }

  /**
   * Remove authorization header
   */
  clearAuth(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Set default timeout
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  /**
   * Add default header
   */
  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * Remove default header
   */
  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  /**
   * Upload file
   */
  async uploadFile(url: string, file: Buffer | Blob, fileName: string, fieldName: string = 'file'): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append(fieldName, file, fileName);

    const headers = { ...this.defaultHeaders };
    delete headers['Content-Type']; // Let browser set it for FormData

    return this.request({
      method: 'POST',
      url,
      data: formData,
      headers
    });
  }

  /**
   * Download file
   */
  async downloadFile(url: string, headers?: Record<string, string>): Promise<Buffer> {
    const response = await this.request({
      method: 'GET',
      url,
      headers
    });

    if (response.success) {
      return Buffer.from(response.data);
    }

    throw new Error(`Failed to download file: ${response.message}`);
  }

  // Private helper methods
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    if (!params) {
      return url;
    }

    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlObj.searchParams.append(key, String(value));
      }
    });

    return urlObj.toString();
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    
    // Remove sensitive headers from logs
    const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie'];
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}