import { describe, test, expect } from "bun:test";
import { Ok, Err, match } from "./index";

describe("Result helpers", () => {
  describe("Ok", () => {
    test("creates successful result with value", () => {
      const result = Ok(42);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(42);
      }
    });

    test("works with different value types", () => {
      const stringResult = Ok("success");
      expect(stringResult.ok).toBe(true);

      const objectResult = Ok({ id: 1, name: "test" });
      expect(objectResult.ok).toBe(true);
      if (objectResult.ok) {
        expect(objectResult.value).toEqual({ id: 1, name: "test" });
      }

      const nullResult = Ok(null);
      expect(nullResult.ok).toBe(true);
      if (nullResult.ok) {
        expect(nullResult.value).toBe(null);
      }
    });
  });

  describe("Err", () => {
    test("creates error result with error value", () => {
      const result = Err("Something went wrong");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("Something went wrong");
      }
    });

    test("works with different error types", () => {
      const objectError = Err({ status: 404, message: "Not found" });
      expect(objectError.ok).toBe(false);
      if (!objectError.ok) {
        expect(objectError.error).toEqual({ status: 404, message: "Not found" });
      }
    });
  });

  describe("match", () => {
    test("calls ok handler for successful result", () => {
      const result = Ok(42);

      const output = match(result, {
        ok: (value) => `Success: ${value}`,
        err: (error) => `Error: ${error}`,
      });

      expect(output).toBe("Success: 42");
    });

    test("calls err handler for error result", () => {
      const result = Err("Failed");

      const output = match(result, {
        ok: (value) => `Success: ${value}`,
        err: (error) => `Error: ${error}`,
      });

      expect(output).toBe("Error: Failed");
    });

    test("works with non-string return types", () => {
      const result = Ok(10);

      const doubled = match(result, {
        ok: (value) => value * 2,
        err: () => 0,
      });

      expect(doubled).toBe(20);
    });

    test("preserves type information in handlers", () => {
      interface User {
        id: number;
        name: string;
      }

      const result = Ok<User>({ id: 1, name: "Alice" });

      const output = match(result, {
        ok: (user) => user.name.toUpperCase(),
        err: () => "UNKNOWN",
      });

      expect(output).toBe("ALICE");
    });
  });
});
