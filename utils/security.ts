
/**
 * 보안 유틸리티: 입력값 정제 및 속도 제한
 */

// 1. 입력값 정제 (XSS 및 프롬프트 인젝션 방지)
export const sanitizeInput = (text: string): string => {
  if (!text) return "";
  // HTML 태그 제거 및 특수문자 치환
  return text
    .replace(/<[^>]*>?/gm, '')
    .replace(/[;'"\\]/g, '')
    .trim()
    .substring(0, 100); // 길이 제한
};

// 2. 클라이언트 사이드 속도 제한 (Rate Limiter)
class RateLimiter {
  private lastRequestTime: number = 0;
  private readonly minInterval: number = 5000; // 최소 5초 간격

  canRequest(): boolean {
    const now = Date.now();
    if (now - this.lastRequestTime < this.minInterval) {
      return false;
    }
    this.lastRequestTime = now;
    return true;
  }

  getTimeRemaining(): number {
    const remaining = this.minInterval - (Date.now() - this.lastRequestTime);
    return Math.max(0, Math.ceil(remaining / 1000));
  }
}

export const globalRateLimiter = new RateLimiter();

// 3. 지수 백오프를 이용한 재시도 로직
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0 || (error.status && error.status < 500)) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};
