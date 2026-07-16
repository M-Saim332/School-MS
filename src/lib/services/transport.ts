import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/services/activity";
import type { AppUser } from "@/types/database";

function isMissingTransportSchema(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42883" ||
    error.message?.includes("public.transport_routes") ||
    error.message?.includes("public.transport_drivers") ||
    error.message?.includes("public.transport_vehicles") ||
    error.message?.includes("public.transport_vehicle_dashboard") ||
    error.message?.includes("public.student_transport_assignments") ||
    error.message?.includes("assign_student_transport")
  );
}

function missingTransportMessage() {
  return "Transport workflows are not available because the latest School OS database migration has not been applied.";
}

function assertCanManageTransport(user: AppUser) {
  if (!hasPermission(user.role, "transport:manage", user.permissions)) {
    throw new Error("Unauthorized to manage transport.");
  }
}

export async function getTransportDashboard(user: AppUser) {
  const supabase = await createClient();
  const [routes, drivers, vehicles, assignments, students] = await Promise.all([
    supabase.from("transport_routes").select("*").eq("school_id", user.schoolId).order("name"),
    supabase.from("transport_drivers").select("*").eq("school_id", user.schoolId).order("full_name"),
    supabase.from("transport_vehicle_dashboard").select("*").eq("school_id", user.schoolId).order("plate_number"),
    supabase
      .from("student_transport_assignments")
      .select("id,vehicle_id,student_id,students(first_name,last_name,admission_number)")
      .eq("school_id", user.schoolId)
      .order("assigned_at", { ascending: false }),
    supabase
      .from("student_directory")
      .select("id,first_name,last_name,admission_number,class_name,grade_name")
      .eq("school_id", user.schoolId)
      .eq("status", "active")
      .order("last_name")
  ]);

  for (const result of [routes, drivers, vehicles, assignments, students]) {
    if (isMissingTransportSchema(result.error)) {
      return {
        routes: [],
        drivers: [],
        vehicles: [],
        assignments: [],
        students: [],
        migrationRequired: true
      };
    }
    if (result.error) throw new Error(result.error.message);
  }

  return {
    routes: routes.data ?? [],
    drivers: drivers.data ?? [],
    vehicles: vehicles.data ?? [],
    assignments: (assignments.data ?? []).map((row: any) => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      student_id: row.student_id,
      student_name: `${row.students?.first_name ?? ""} ${row.students?.last_name ?? ""}`.trim(),
      admission_number: row.students?.admission_number
    })),
    students: students.data ?? [],
    migrationRequired: false
  };
}

export async function createTransportRoute(user: AppUser, formData: FormData) {
  assertCanManageTransport(user);
  const supabase = await createClient();
  const { error } = await supabase.from("transport_routes").insert({
    school_id: user.schoolId,
    name: String(formData.get("name") ?? "").trim(),
    start_point: String(formData.get("start_point") ?? "").trim(),
    end_point: String(formData.get("end_point") ?? "").trim(),
    monthly_fare: Number(formData.get("monthly_fare") ?? 0)
  });
  if (isMissingTransportSchema(error)) throw new Error(missingTransportMessage());
  if (error) throw new Error(error.message);
}

export async function createTransportDriver(user: AppUser, formData: FormData) {
  assertCanManageTransport(user);
  const supabase = await createClient();
  const { error } = await supabase.from("transport_drivers").insert({
    school_id: user.schoolId,
    full_name: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    license_number: String(formData.get("license_number") ?? "").trim(),
    status: "active"
  });
  if (isMissingTransportSchema(error)) throw new Error(missingTransportMessage());
  if (error) throw new Error(error.message);
}

export async function createTransportVehicle(user: AppUser, formData: FormData) {
  assertCanManageTransport(user);
  const supabase = await createClient();
  const driverId = String(formData.get("driver_id") ?? "");
  const routeId = String(formData.get("route_id") ?? "");
  const { error } = await supabase.from("transport_vehicles").insert({
    school_id: user.schoolId,
    plate_number: String(formData.get("plate_number") ?? "").trim(),
    seat_capacity: Number(formData.get("seat_capacity") ?? 0),
    driver_id: driverId || null,
    route_id: routeId || null,
    status: "active"
  });
  if (isMissingTransportSchema(error)) throw new Error(missingTransportMessage());
  if (error) throw new Error(error.message);
}

export async function assignStudentToVehicle(user: AppUser, formData: FormData) {
  assertCanManageTransport(user);
  const studentId = String(formData.get("student_id") ?? "");
  const vehicleId = String(formData.get("vehicle_id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.rpc("assign_student_transport", {
    p_school_id: user.schoolId,
    p_student_id: studentId,
    p_vehicle_id: vehicleId,
    p_actor_id: user.id
  });
  if (isMissingTransportSchema(error)) throw new Error(missingTransportMessage());
  if (error) throw new Error(error.message);
  await logActivity(user, "transport_student_assigned", "student", studentId, { vehicle_id: vehicleId });
}

export async function removeStudentTransport(user: AppUser, assignmentId: string) {
  assertCanManageTransport(user);
  const supabase = await createClient();
  const { error } = await supabase
    .from("student_transport_assignments")
    .delete()
    .eq("school_id", user.schoolId)
    .eq("id", assignmentId);
  if (isMissingTransportSchema(error)) throw new Error(missingTransportMessage());
  if (error) throw new Error(error.message);
  await logActivity(user, "transport_student_removed", "transport_assignment", assignmentId);
}
