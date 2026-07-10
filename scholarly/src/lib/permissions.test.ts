import { describe, expect, it } from "vitest";
import { hasPermission, roleHome } from "@/lib/permissions";

describe("role permissions", () => {
  it("allows administrators to manage users and settings", () => {
    expect(hasPermission("administrator", "users:manage")).toBe(true);
    expect(hasPermission("administrator", "settings:manage")).toBe(true);
  });

  it("prevents teachers from managing students outside attendance", () => {
    expect(hasPermission("teacher", "students:create")).toBe(false);
    expect(hasPermission("teacher", "students:archive")).toBe(false);
    expect(hasPermission("teacher", "attendance:submit")).toBe(true);
  });

  it("routes users to role-aware homes", () => {
    expect(roleHome("teacher")).toBe("/dashboard?role=teacher");
    expect(roleHome("administrator")).toBe("/admin");
    expect(roleHome("principal")).toBe("/dashboard");
  });
});
