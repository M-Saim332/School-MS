import { describe, expect, it } from "vitest";
import { initials, toCsv } from "@/lib/utils";
import { calculateGrade, percentage } from "@/lib/grades";

describe("utilities", () => {
  it("builds initials from display names", () => {
    expect(initials("Jane Doe")).toBe("JD");
    expect(initials("Miles")).toBe("M");
  });

  it("exports csv with escaped quotes", () => {
    expect(toCsv([{ name: 'Alex "A"', status: "active" }])).toContain('"Alex ""A"""');
  });

  it("calculates percentages and grades", () => {
    expect(percentage(45, 50)).toBe(90);
    expect(calculateGrade(45, 50)).toBe("A+");
    expect(calculateGrade(32, 50)).toBe("C");
  });
});
