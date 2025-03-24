import axios, { AxiosResponse } from 'axios';
import { getUserAgent } from 'universal-user-agent';
import { Config, buildApiUrl } from './config.js';

// HTTP 메소드 정의
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// 요청 옵션 인터페이스
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: any;
  timeout?: number;
}

// HTTP 에러 클래스
export class GitHubError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
    this.data = data;
  }
}

/**
 * GitHub API 요청을 수행하는 클라이언트
 */
export class GitHubClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * GitHub API 요청 수행
   */
  async request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = buildApiUrl(this.config, path);
    const method = options.method || 'GET';
    
    // URL 파라미터 처리
    const urlWithParams = this.addQueryParams(url, options.params);
    
    // 헤더 준비
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': this.config.userAgent,
      ...options.headers || {},
    };

    // 토큰이 있으면 인증 헤더 추가
    if (this.config.token) {
      headers['Authorization'] = `token ${this.config.token}`;
    }

    // 요청 바디 처리
    let data = options.body;
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      headers['Content-Type'] = 'application/json';
    }

    // 요청 디버그 로깅
    if (this.config.debug) {
      console.log(`[GitHub API] ${method} ${urlWithParams}`);
      console.log(`[GitHub API] 베이스 URL: ${this.config.baseUrl}`);
      if (data) console.log(`[GitHub API] Request body: ${JSON.stringify(data)}`);
    }

    // 타임아웃 설정
    const timeout = options.timeout || this.config.timeout;

    // 요청 실행
    try {
      const response = await axios({
        method: method.toLowerCase(),
        url: urlWithParams,
        headers,
        data,
        timeout
      });

      return response.data as T;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        // 타임아웃 오류 처리
        if (error.code === 'ECONNABORTED') {
          throw new GitHubError(
            `GitHub API 요청 타임아웃: 요청이 ${timeout}ms 내에 완료되지 않았습니다.`,
            408
          );
        }

        const status = error.response?.status || 0;
        let errorData = error.response?.data;
        let errorMessage = `GitHub API 오류: ${status} ${error.message}`;

        // 특정 오류 코드에 대한 사용자 친화적 메시지
        if (status === 401) {
          errorMessage = 'GitHub API 인증 오류: 인증 토큰이 유효하지 않거나 만료되었습니다.';
        } else if (status === 403) {
          errorMessage = 'GitHub API 접근 거부: 이 작업을 수행할 권한이 없습니다.';
        } else if (status === 404) {
          errorMessage = `GitHub API 리소스를 찾을 수 없음: ${path}`;
        } else if (status === 422) {
          errorMessage = 'GitHub API 검증 오류: 요청 데이터가 올바르지 않습니다.';
        } else if (status >= 500) {
          errorMessage = 'GitHub API 서버 오류: 잠시 후 다시 시도하세요.';
        }

        throw new GitHubError(errorMessage, status, errorData);
      }

      // 기타 네트워크 오류
      throw new GitHubError(
        `GitHub API 네트워크 오류: ${error.message}`,
        0
      );
    }
  }

  /**
   * 요청 URL에 쿼리 파라미터 추가
   */
  private addQueryParams(url: string, params?: Record<string, any>): string {
    if (!params) return url;

    const queryParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    }

    const queryString = queryParams.toString();
    if (!queryString) return url;

    return url.includes('?') 
      ? `${url}&${queryString}` 
      : `${url}?${queryString}`;
  }

  /**
   * GET 요청 헬퍼
   */
  async get<T = any>(path: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * POST 요청 헬퍼
   */
  async post<T = any>(path: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  /**
   * PUT 요청 헬퍼
   */
  async put<T = any>(path: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH 요청 헬퍼
   */
  async patch<T = any>(path: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE 요청 헬퍼
   */
  async delete<T = any>(path: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
} 