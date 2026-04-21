const nextConfig = { 
  reactStrictMode: false, 
  // Explicitly set basePath to empty string to prevent Next.js from adding any base path
  // This ensures images and assets are served from root path, not /executive_dashboard/
  basePath: '',
  images: { 
    unoptimized: true,
    // Ensure images from public folder are properly handled
    remotePatterns: [],
  },
  // Trailing slash for consistency
  trailingSlash: false,
  // Ensure public folder is properly served
  // Next.js automatically serves files from the 'public' folder
};

export default nextConfig;
