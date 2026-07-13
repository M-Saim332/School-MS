import { PageHeader } from "@/components/layout/page-header";
import { AttendanceForm } from "@/components/attendance/attendance-form";
import { AttendanceOverview } from "@/components/attendance/attendance-overview";
import { requireUser } from "@/lib/auth/session";
import { getAttendanceContext, getAttendanceOverview } from "@/lib/services/attendance";
import { hasPermission } from "@/lib/permissions";
import { submitAttendanceAction } from "@/app/(app)/attendance/actions";

export default async function AttendancePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("attendance:view");
  if (user.role !== "teacher") {
    const overview = await getAttendanceOverview(user);

    return (
      <>
        <PageHeader
          eyebrow="Attendance intelligence"
          title="Attendance"
          description="Review running attendance percentage, marked attendance days, and class-by-class attendance health."
        />
        <AttendanceOverview overview={overview} />
      </>
    );
  }

  const context = await getAttendanceContext(user, params.classId, params.date);
  const selectedClass = context.classes.find((item) => item.id === context.selectedClassId);

  return (
    <>
      <PageHeader
        eyebrow="Daily workflow"
        title="Attendance"
        description="Choose a date and class, mark the roster, and submit attendance once for that class and day."
      />
      <AttendanceForm
        classes={context.classes}
        roster={context.roster}
        selectedClassId={context.selectedClassId}
        attendanceDate={context.attendanceDate}
        submitted={Boolean(context.session)}
        canSubmit={hasPermission(user.role, "attendance:submit") && Boolean(selectedClass?.can_mark_attendance) && !context.session}
        restrictionMessage={selectedClass && !selectedClass.can_mark_attendance ? "Only the head teacher can mark attendance." : null}
        onSubmit={submitAttendanceAction}
      />
    </>
  );
}
