/**
 * API Debugging Utilities
 * Use these functions to debug API URL issues in production
 */

import { validateApiUrl, AM_API_URL } from './config';

/**
 * Log API configuration details for debugging
 * Call this in your browser console or in a component to see what URL is being used
 */
export function logApiConfig() {
  const validation = validateApiUrl();
  const isClient = typeof window !== 'undefined';
  const context = isClient ? '[CLIENT]' : '[SERVER]';
  
  console.group(`🔍 ${context} API Configuration Debug`);
  console.log('Validation Result:', validation);
  console.log('AM_API_URL constant:', AM_API_URL);
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    hasNextPublicAmApiUrl: !!process.env.NEXT_PUBLIC_AM_API_URL,
    rawValue: process.env.NEXT_PUBLIC_AM_API_URL || '(not set)',
  });
  
  if (isClient) {
    console.log('Client-side environment check:', {
      windowLocation: window.location.href,
      hostname: window.location.hostname,
    });
  }
  
  console.groupEnd();
  
  return validation;
}

/**
 * Test API connectivity
 * This will make a test request to verify the API is reachable
 */
export async function testApiConnection(endpoint: string = '/health'): Promise<{
  success: boolean;
  url: string;
  status?: number;
  error?: string;
}> {
  try {
    const baseUrl = AM_API_URL;
    const testUrl = `${baseUrl}${endpoint}`;
    
    console.log('🧪 Testing API connection to:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = {
      success: response.ok,
      url: testUrl,
      status: response.status,
    };
    
    if (response.ok) {
      console.log('✅ API connection successful:', result);
    } else {
      console.error('❌ API connection failed:', result);
    }
    
    return result;
  } catch (error: any) {
    const result = {
      success: false,
      url: `${AM_API_URL}${endpoint}`,
      error: error.message || 'Unknown error',
    };
    
    console.error('❌ API connection error:', result);
    return result;
  }
}

// Make it available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugApi = {
    logConfig: logApiConfig,
    testConnection: testApiConnection,
  };
  console.log('💡 API Debug tools available: window.debugApi.logConfig() or window.debugApi.testConnection()');
}

