import { describe, expect, it } from "vitest";
import { hasPermission, roleHome } from "@/lib/permissions";

describe("role permissions", () => {
  it("allows administrators to manage users and settings", () => {
    expect(hasPermission("administrator", "users:manage")).toBe(true);
    expect(hasPermission("administrator", "settings:manage")).toBe(true);
  });

  it("limits teachers to academic assignment visibility", () => {
    expect(hasPermission("teacher", "students:create")).toBe(false);
    expect(hasPermission("teacher", "students:archive")).toBe(false);
    expect(hasPermission("teacher", "attendance:submit")).toBe(false);
    expect(hasPermission("teacher", "academics:view")).toBe(true);
  });

  it("routes users to role-aware homes", () => {
    expect(roleHome("teacher")).toBe("/academics");
    expect(roleHome("administrator")).toBe("/admin");
    expect(roleHome("principal")).toBe("/dashboard");
  });
});
