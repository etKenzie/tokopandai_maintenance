'use client';

/**
 * React hook to get the current base path
 */
export const useBasePath = (): string => {
  return '';
};

/**
 * Hook to create URLs with the correct base path
 */
export const useCreateUrl = () => {
  const basePath = useBasePath();
  
  return (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${basePath}${cleanPath}`;
  };
};

