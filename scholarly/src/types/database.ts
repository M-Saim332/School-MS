export type UserRole = "principal" | "teacher" | "student_staff" | "administrator";
export type StudentStatus =
  | "active"
  | "graduated"
  | "transferred"
  | "archived"
  | "pending_approval"
  | "pending_cancellation";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type ApprovalRequestType = "admission" | "cancellation";
export type ApprovalRequestStatus = "pending" | "approved" | "denied";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SchoolMember = {
  id: string;
  school_id: string;
  user_id: string;
  role: UserRole;
  status: "active" | "invited" | "disabled";
  department: string | null;
  job_title: string | null;
};

export type AppUser = {
  id: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  schoolId: string;
  schoolName: string;
  role: UserRole;
};

export type Student = {
  id: string;
  school_id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string;
  gender: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  admission_date: string;
  status: StudentStatus;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentListRow = Student & {
  grade_name: string | null;
  class_name: string | null;
  section_name: string | null;
  guardian_name: string | null;
  attendance_rate: number | null;
};

export type ClassRow = {
  id: string;
  school_id: string;
  name: string;
  grade_name: string;
  section_name: string | null;
  academic_year_name: string;
  room: string | null;
  student_count?: number;
};

export type AttendanceRosterRow = {
  enrollment_id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  current_status: AttendanceStatus | null;
  note: string | null;
};

export type ApprovalRequest = {
  id: string;
  school_id: string;
  request_type: ApprovalRequestType;
  student_id: string;
  submitted_by: string;
  reviewed_by: string | null;
  status: ApprovalRequestStatus;
  denial_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  // Joined fields
  student_first_name?: string | null;
  student_last_name?: string | null;
  student_admission_number?: string | null;
  submitted_by_name?: string | null;
  reviewed_by_name?: string | null;
  class_name?: string | null;
  grade_name?: string | null;
};
