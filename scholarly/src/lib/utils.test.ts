import { describe, expect, it } from "vitest";
import { initials, toCsv } from "@/lib/utils";

describe("utilities", () => {
  it("builds initials from display names", () => {
    expect(initials("Jane Doe")).toBe("JD");
    expect(initials("Miles")).toBe("M");
  });

  it("exports csv with escaped quotes", () => {
    expect(toCsv([{ name: 'Alex "A"', status: "active" }])).toContain('"Alex ""A"""');
  });
});
