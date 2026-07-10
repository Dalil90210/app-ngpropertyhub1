import { describe, expect, it } from "vitest";
import { getAuthenticatedDestination } from "./auth-redirect";

describe("getAuthenticatedDestination", () => {
  it("keeps intended destination when provided", () => {
    expect(
      getAuthenticatedDestination({
        role: null,
        dest: "/role-select?role=buyer",
      }),
    ).toBe("/role-select?role=buyer");
  });

  it("routes authenticated users with role to dashboard by default", () => {
    expect(getAuthenticatedDestination({ role: "buyer", dest: null })).toBe("/dashboard");
  });

  it("routes authenticated users without role to role-select by default", () => {
    expect(getAuthenticatedDestination({ role: null, dest: null })).toBe("/role-select");
  });
});
