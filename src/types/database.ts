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
export type ExamType =
  | "quiz"
  | "class_test"
  | "assignment"
  | "presentation"
  | "lab"
  | "viva"
  | "attendance"
  | "monthly"
  | "mid_term"
  | "final_term"
  | "pre_board"
  | "annual_exam";
export type ExamStatus = "draft" | "submitted" | "approved" | "rejected";
export type MarkStatus = "draft" | "submitted" | "approved" | "rejected";
export type ResultApprovalStatus = "pending" | "approved" | "rejected";
export type AssessmentCategory = "regular" | "major";
export type ResultWorkflowStatus = "draft" | "uploaded" | "pending_approval" | "approved" | "rejected";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  must_change_password: boolean;
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
  department: string | null;
  jobTitle: string | null;
  mustChangePassword: boolean;
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
  head_teacher_id: string;
  head_teacher_name?: string | null;
  head_teacher_email?: string | null;
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

export type Exam = {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  exam_type: ExamType;
  assessment_category: AssessmentCategory;
  requires_approval: boolean;
  title: string;
  term: string;
  exam_date: string;
  max_marks: number;
  created_by: string;
  uploaded_by_teacher_id: string | null;
  uploaded_by_teacher_name: string | null;
  uploaded_at: string | null;
  approval_status: ResultWorkflowStatus;
  approved_by_principal_id: string | null;
  approved_by_principal_name: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  status: ExamStatus;
  submitted_at: string | null;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Mark = {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  marks_obtained: number;
  grade: string;
  status: MarkStatus;
  teacher_comment: string | null;
  created_at: string;
  updated_at: string;
};

export type ResultApproval = {
  id: string;
  school_id: string;
  exam_id: string;
  submitted_by: string;
  reviewed_by: string | null;
  status: ResultApprovalStatus;
  principal_comment: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};
