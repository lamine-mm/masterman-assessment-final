/**
 * Next.js instrumentation hook — runs once when the Node.js server starts.
 * Used to validate required environment variables before the first request.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run in the Node.js runtime (not Edge, not during static build)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("./lib/env");
    validateEnv();
  }
}
