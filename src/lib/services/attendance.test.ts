import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitAttendance } from "./attendance";
import * as server from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn()
}));
vi.mock("@/lib/services/activity", () => ({
  logActivity: vi.fn()
}));

const DUMMY_SCHOOL = "50000000-0000-0000-0000-000000000001";
const DUMMY_CLASS = "60000000-0000-0000-0000-000000000001";

describe("Attendance Services", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis()
    };
    (server.createClient as any).mockResolvedValue(mockSupabase);
  });

  it("prevents submitting duplicate attendance sessions for the same day and class", async () => {
    // 1st maybeSingle: targetClass lookup
    mockSupabase.maybeSingle.mockResolvedValueOnce({
      data: { id: DUMMY_CLASS, head_teacher_id: "user1" },
      error: null
    });
    
    // 2nd maybeSingle: existingSession lookup
    mockSupabase.maybeSingle.mockResolvedValueOnce({
      data: { id: "existing-session" },
      error: null
    });

    // Simulate inserting new records returns success
    mockSupabase.insert.mockResolvedValue({ data: { id: "some-id" }, error: null });

    const user = { id: "user1", schoolId: DUMMY_SCHOOL, memberId: "m1", permissions: ["attendance:submit"] };
    
    const promise = submitAttendance(user, {
      class_id: DUMMY_CLASS,
      attendance_date: "2026-09-15",
      records: [{
        student_id: "70000000-0000-0000-0000-000000000001",
        status: "present",
        note: ""
      }]
    });
    
    await expect(promise).rejects.toThrow("Attendance already marked for today.");
  });
});
