import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStudents } from "./students";
import * as server from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn()
}));

const DUMMY_SCHOOL = "50000000-0000-0000-0000-000000000001";
const OTHER_SCHOOL = "50000000-0000-0000-0000-000000000002";

describe("Tenant Isolation", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis()
    };
    (server.createClient as any).mockResolvedValue(mockSupabase);
  });

  it("always scopes student directory queries by user schoolId", async () => {
    mockSupabase.order.mockResolvedValue({ data: [], count: 0, error: null });

    await getStudents({ 
      id: "user1", 
      schoolId: DUMMY_SCHOOL,
      memberId: "m1",
      permissions: ["students:view"],
      role: "administrator"
    } as any, {});

    // Ensure the query specifically matched the logged-in user's schoolId
    expect(mockSupabase.eq).toHaveBeenCalledWith("school_id", DUMMY_SCHOOL);
  });
});
