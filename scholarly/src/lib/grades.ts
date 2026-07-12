export type GradeScale = {
  grade: string;
  min_percentage: number;
  max_percentage: number;
};

export const defaultGradeScale: GradeScale[] = [
  { grade: "A+", min_percentage: 90, max_percentage: 100 },
  { grade: "A", min_percentage: 80, max_percentage: 89.99 },
  { grade: "B", min_percentage: 70, max_percentage: 79.99 },
  { grade: "C", min_percentage: 60, max_percentage: 69.99 },
  { grade: "D", min_percentage: 50, max_percentage: 59.99 },
  { grade: "F", min_percentage: 0, max_percentage: 49.99 }
];

export function percentage(marksObtained: number, maxMarks: number) {
  if (!Number.isFinite(maxMarks) || maxMarks <= 0) return 0;
  return Math.max(0, Math.min(100, (marksObtained / maxMarks) * 100));
}

export function calculateGrade(marksObtained: number, maxMarks: number, scale: GradeScale[] = defaultGradeScale) {
  const value = percentage(marksObtained, maxMarks);
  const sorted = [...scale].sort((a, b) => b.min_percentage - a.min_percentage);
  return sorted.find((item) => value >= item.min_percentage && value <= item.max_percentage)?.grade ?? "F";
}
