import type { MiddlewareHandler } from "hono";
import { endTime, startTime } from "hono/timing";

// Don't even bother trying with the types
export function runConcurrently(...middlewares: MiddlewareHandler[]): MiddlewareHandler {
    const noop = async () => {};

    return async (c, next) => {
      startTime(c, "CONCURRENT")
      await Promise.all(middlewares.map(m => m(c, noop)));
      endTime(c, "CONCURRENT")
      await next()
    }
}
