import { describe, expect, it } from "vitest";
import { cn, getErrorMessage } from "./utils";

describe("getErrorMessage", () => {
  it("returns the message of an Error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("reads message from Supabase-style error objects", () => {
    expect(getErrorMessage({ message: "Invalid login credentials" })).toBe("Invalid login credentials");
  });

  it("falls back to a friendly message for unknown values", () => {
    expect(getErrorMessage(undefined)).toMatch(/something went wrong/i);
    expect(getErrorMessage(42)).toMatch(/something went wrong/i);
  });
});

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("ignores falsy values", () => {
    const skip = false;
    expect(cn("a", skip && "b", undefined, "c")).toBe("a c");
  });
});
