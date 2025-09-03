export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Client-side
    return "";
  }

  // ✅ Server-side (SSR / build)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // ✅ Local geliştirme
  return "http://localhost:3000";
}
