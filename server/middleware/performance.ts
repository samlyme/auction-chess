import type { MiddlewareHandler } from "hono";
import type { Env } from "hono/types";

/**
 * Performance metrics for a single middleware execution
 */
export interface MiddlewareMetric {
  name: string;
  duration: number; // in milliseconds
  timestamp: number;
}

/**
 * Environment with performance metrics
 */
export type PerformanceEnv = {
  Variables: {
    performanceMetrics: MiddlewareMetric[];
  };
};

/**
 * Request performance metrics
 */
export interface RequestMetrics {
  path: string;
  method: string;
  totalDuration: number;
  middleware: MiddlewareMetric[];
  timestamp: number;
}

/**
 * Wraps a middleware to measure its execution time (excluding downstream middleware)
 * @param middleware - The middleware function to measure
 * @param name - A descriptive name for the middleware
 * @returns The wrapped middleware that tracks performance
 */
export function measureMiddleware<E extends Env = Env>(
  middleware: MiddlewareHandler,
  name: string,
): MiddlewareHandler<E & PerformanceEnv> {
  return async (c, next) => {
    const startTotal = performance.now();
    let nextDuration = 0;

    // Wrap the next() call to measure downstream time
    const wrappedNext = async () => {
      const nextStart = performance.now();
      await next();
      nextDuration = performance.now() - nextStart;
    };

    try {
      return await middleware(c, wrappedNext);
    } finally {
      const totalDuration = performance.now() - startTotal;
      // Calculate time spent in THIS middleware only (excluding downstream)
      const ownDuration = totalDuration - nextDuration;

      // Store the metric in the context
      const metrics = c.get("performanceMetrics");
      metrics.push({
        name,
        duration: ownDuration,
        timestamp: Date.now(),
      });
      c.set("performanceMetrics", metrics);
    }
  };
}

/**
 * Middleware to track overall request timing and log all performance metrics
 */
export const requestTimer: MiddlewareHandler = async (c, next) => {
  const requestStart = performance.now();
  const requestTimestamp = Date.now();

  // Initialize metrics array
  c.set("performanceMetrics", []);

  await next();

  const totalDuration = performance.now() - requestStart;
  const metrics = c.get("performanceMetrics") || [];

  // Build the performance report
  const report: RequestMetrics = {
    path: c.req.path,
    method: c.req.method,
    totalDuration,
    middleware: metrics,
    timestamp: requestTimestamp,
  };

  // Log the performance metrics
  logPerformanceMetrics(report);
};

/**
 * Logs performance metrics in a structured format
 */
function logPerformanceMetrics(report: RequestMetrics) {
  const formattedDuration = report.totalDuration.toFixed(2);
  const lines: string[] = [];

  lines.push(`\n🔍 Performance Report: ${report.method} ${report.path}`);
  lines.push(`⏱️  Total Duration: ${formattedDuration}ms`);

  if (report.middleware.length > 0) {
    lines.push("📊 Middleware Breakdown:");

    // Sort middleware by duration (slowest first) for easier debugging
    const metrics = [...report.middleware].reverse();

    metrics.forEach((metric) => {
      const percentage = ((metric.duration / report.totalDuration) * 100).toFixed(1);
      const duration = metric.duration.toFixed(2);
      const bar = "█".repeat(Math.floor((metric.duration / report.totalDuration) * 10)); // Visual bar

      lines.push(`   ${metric.name.padEnd(25)} ${duration.padStart(8)}ms  ${percentage.padStart(5)}%  ${bar}`);
    });

    // Calculate middleware overhead
    const middlewareTotal = report.middleware.reduce((sum, m) => sum + m.duration, 0);
    const overhead = report.totalDuration - middlewareTotal;
    const bar = "█".repeat(Math.floor((overhead / report.totalDuration) * 10)); // Visual bar

    if (overhead > 0.1) {
      lines.push(`   ${"[Other/Handler]".padEnd(25)} ${overhead.toFixed(2).padStart(8)}ms  ${((overhead / report.totalDuration) * 100).toFixed(1).padStart(5)}%  ${bar}`);
    }
  }

  // Highlight slow requests
  if (report.totalDuration > 1000) {
    lines.push(`⚠️  SLOW REQUEST: This request took ${formattedDuration}ms`);
  }

  lines.push(""); // Empty line for readability

  // Single atomic log to prevent interleaving in concurrent environments
  console.log(lines.join("\n"));
}

/**
 * Helper to create a performance-aware middleware with automatic naming
 */
export function createMeasuredMiddleware<E extends Env = Env>(
  name: string,
  handler: MiddlewareHandler<E>,
): MiddlewareHandler {
  return measureMiddleware(handler, name);
}
