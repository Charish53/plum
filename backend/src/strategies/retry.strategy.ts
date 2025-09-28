// Retry Strategy Pattern implementation

import type { IRetryStrategy } from '../interfaces/ocr.interfaces';

export class ExponentialBackoffRetryStrategy implements IRetryStrategy {
  async execute<T>(
    operation: () => Promise<T>, 
    maxRetries: number
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries}...`);
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`❌ Attempt ${attempt} failed:`, lastError.message);
        
        const isRetryable = this.isRetryableError(lastError);
        
        if (attempt < maxRetries && isRetryable) {
          const delay = this.calculateDelay(attempt);
          console.log(`⏳ Retrying in ${delay/1000} seconds...`);
          await this.sleep(delay);
        } else if (attempt === maxRetries) {
          throw lastError;
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }

  private isRetryableError(error: Error): boolean {
    return error.message.includes('503') || 
           error.message.includes('Service Unavailable') ||
           error.message.includes('timeout') ||
           error.message.includes('network') ||
           error.message.includes('ECONNRESET') ||
           error.message.includes('ETIMEDOUT');
  }

  private calculateDelay(attempt: number): number {
    return Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class LinearRetryStrategy implements IRetryStrategy {
  constructor(private baseDelay: number = 1000) {}

  async execute<T>(
    operation: () => Promise<T>, 
    maxRetries: number
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries}...`);
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`❌ Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${this.baseDelay/1000} seconds...`);
          await this.sleep(this.baseDelay);
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
