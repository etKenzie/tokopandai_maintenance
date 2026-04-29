// API Configuration
export const config = {
  APP_NAME: 'AM Dashboard',
  VERSION: '1.0.0',
};

/**
 * Get the AM API URL from environment variables with validation
 * This function ensures the environment variable is loaded and provides helpful error messages
 */
export function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isClient = typeof window !== 'undefined';
  
  // Log environment info for debugging
  if (!apiUrl) {
    const context = isClient ? '[CLIENT]' : '[SERVER]';
    console.error(`❌ ${context} NEXT_PUBLIC_API_URL is not set!`);
    console.error(`${context} Environment check:`, {
      nodeEnv: process.env.NODE_ENV,
      hasEnvVar: !!apiUrl,
      isClient,
      isDevelopment,
      // Only log all NEXT_PUBLIC vars in development
      ...(isDevelopment && {
        allNextPublicVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
      }),
    });
    
    const errorMessage = 
      'NEXT_PUBLIC_API_URL environment variable is not set.\n\n' +
      'Local Development:\n' +
      '  - Create a .env.local file in the project root\n' +
      '  - Add: NEXT_PUBLIC_API_URL=https://your-api-url.com\n\n' +
      'Production:\n' +
      '  - Set the environment variable in your hosting platform:\n' +
      '    • Vercel: Project Settings → Environment Variables\n' +
      '    • Netlify: Site Settings → Environment Variables\n' +
      '    • Other: Check your platform\'s documentation\n\n' +
      'Note: NEXT_PUBLIC_* variables must be set at BUILD TIME for Next.js.';
    
    console.error('🚨 API Configuration Error:', errorMessage);
    throw new Error(errorMessage);
  }
  
  // Remove trailing slash if present
  const cleanUrl = apiUrl.replace(/\/$/, '');
  
  // Log in development to help with debugging
  if (isDevelopment) {
    const context = isClient ? '[CLIENT]' : '[SERVER]';
    console.log(`${context} ✅ API URL loaded:`, cleanUrl);
  }
  
  return cleanUrl;
}

/**
 * Runtime validation helper - call this in components to verify the API URL is set
 * Useful for debugging production issues
 */
export function validateApiUrl(): { isValid: boolean; url: string | null; error?: string } {
  try {
    const url = getApiUrl();
    return { isValid: true, url };
  } catch (error: any) {
    return { 
      isValid: false, 
      url: null, 
      error: error.message || 'Unknown error validating API URL' 
    };
  }
}

// Export the API URL as a constant (validated at module load)
// This will throw an error immediately if the env var is missing
export const AM_API_URL = getApiUrl();

/** Collection API (client-side). Used for temp internal payroll charts. Optional. */
export function getCollectionApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_COLLECTION_API_URL ?? '';
  return url.replace(/\/$/, '');
}

export function getCollectionApiToken(): string {
  return process.env.NEXT_PUBLIC_COLLECTION_API_TOKEN ?? '';
}

export const COLLECTION_API_URL = getCollectionApiUrl();
export const COLLECTION_API_TOKEN = getCollectionApiToken();

// Log API URL at module load (only once, helps with debugging)
if (typeof window === 'undefined') {
  // Server-side: log once
  console.log('[SERVER] 🚀 AM API URL initialized:', AM_API_URL);
} else {
  // Client-side: log once on first load
  if (!(window as any).__API_URL_LOGGED__) {
    console.log('[CLIENT] 🚀 AM API URL initialized:', AM_API_URL);
    (window as any).__API_URL_LOGGED__ = true;
  }
} 