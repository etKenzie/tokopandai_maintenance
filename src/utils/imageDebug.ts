/**
 * Image Debugging Utilities
 * Use these functions to debug image loading issues in production
 */

/**
 * Test if an image can be loaded from a given path
 */
export async function testImageLoad(src: string): Promise<{
  success: boolean;
  src: string;
  error?: string;
  loadedAt?: string;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const startTime = Date.now();
    
    img.onload = () => {
      const loadTime = Date.now() - startTime;
      resolve({
        success: true,
        src,
        loadedAt: `${loadTime}ms`,
      });
    };
    
    img.onerror = (error) => {
      resolve({
        success: false,
        src,
        error: `Failed to load image: ${src}`,
      });
    };
    
    // Set src to trigger load
    img.src = src;
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!img.complete) {
        resolve({
          success: false,
          src,
          error: 'Image load timeout (10s)',
        });
      }
    }, 10000);
  });
}

/**
 * Test multiple images and log results
 */
export async function testImages(imagePaths: string[]): Promise<void> {
  console.group('🖼️ Image Loading Test');
  console.log(`Testing ${imagePaths.length} images...`);
  
  const results = await Promise.all(
    imagePaths.map(path => testImageLoad(path))
  );
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  successful.forEach(result => {
    console.log(`  ✓ ${result.src} (${result.loadedAt})`);
  });
  
  if (failed.length > 0) {
    console.error(`❌ Failed: ${failed.length}`);
    failed.forEach(result => {
      console.error(`  ✗ ${result.src}: ${result.error}`);
    });
  }
  
  console.groupEnd();
  
  return;
}

/**
 * Get the full URL for an image path (useful for debugging)
 */
export function getImageUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return `${window.location.origin}${cleanPath}`;
  } else {
    // Server-side: return path as-is (will be resolved by Next.js)
    return cleanPath;
  }
}

/**
 * Log image configuration for debugging
 */
export function logImageConfig(): void {
  const isClient = typeof window !== 'undefined';
  const context = isClient ? '[CLIENT]' : '[SERVER]';
  
  console.group(`🖼️ ${context} Image Configuration`);
  
  if (isClient) {
    console.log('Current URL:', window.location.href);
    console.log('Origin:', window.location.origin);
    console.log('Pathname:', window.location.pathname);
    
    // Detect if there's an unexpected basePath
    const pathname = window.location.pathname;
    if (pathname.includes('/executive_dashboard/')) {
      console.warn('⚠️ WARNING: Detected /executive_dashboard/ in URL pathname');
      console.warn('This suggests basePath might be incorrectly configured');
      console.warn('Expected: basePath should be empty string in next.config.mjs');
    }
  }
  
  console.log('Public folder path:', '/images/...');
  console.log('Expected image URLs should start with:', isClient ? window.location.origin : '');
  console.log('Expected image path format: /images/... (no basePath prefix)');
  
  // Test a sample image
  const testImage = '/images/logos/valdo_logo.png';
  const fullUrl = getImageUrl(testImage);
  console.log('Sample image URL:', fullUrl);
  
  // Check if Next.js is adding basePath
  if (isClient) {
    const images = document.querySelectorAll('img[src*="/images/"]');
    if (images.length > 0) {
      console.log('Found images with /images/ in src:');
      images.forEach((img, idx) => {
        const src = (img as HTMLImageElement).src;
        if (src.includes('/executive_dashboard/')) {
          console.error(`  ❌ Image ${idx + 1}: ${src} (has unexpected basePath)`);
        } else {
          console.log(`  ✅ Image ${idx + 1}: ${src}`);
        }
      });
    }
  }
  
  console.groupEnd();
}

// Make it available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugImages = {
    testImage: testImageLoad,
    testImages,
    getImageUrl,
    logConfig: logImageConfig,
  };
  console.log('💡 Image Debug tools available: window.debugImages.testImages(["/images/logos/valdo_logo.png"])');
}

