// lib/getBaseUrl.ts

/**
 * ✅ Next.js 15 ve Vercel uyumlu base URL function
 * Server-side ve client-side için optimize edilmiş
 */
export function getBaseUrl(): string {
  // ✅ Client-side (browser) - relative URL kullan
  if (typeof window !== "undefined") {
    return "";
  }

  // ✅ Server-side (SSR / build time)

  // 1. Vercel deployment URL'si (production)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 2. Custom domain veya production URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // 3. Production environment check
  if (process.env.NODE_ENV === "production") {
    // ✅ Kendi domain'inizi buraya yazın
    return "https://norobilimadu.vercel.app";
  }

  // 4. Development environment
  return process.env.PORT
    ? `http://localhost:${process.env.PORT}`
    : "http://localhost:3000";
}

/**
 * ✅ API çağrıları için optimize edilmiş URL builder
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${baseUrl}/api${cleanEndpoint}`;
}

/**
 * ✅ Static asset URL builder
 */
export function getAssetUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
}

/**
 * ✅ Environment info için utility function
 */
export function getEnvironmentInfo() {
  return {
    isClient: typeof window !== "undefined",
    isServer: typeof window === "undefined",
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
    vercelUrl: process.env.VERCEL_URL,
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
  };
}
