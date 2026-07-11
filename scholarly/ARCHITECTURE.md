# GoCampusFlow Architecture

GoCampusFlow is a multi-tenant school management SaaS built with Next.js, TypeScript, Supabase Auth, Supabase PostgreSQL, and Row Level Security.

## Application Layers

- `src/app`: Next.js App Router routes for auth, protected dashboards, students, attendance, staff, academics, reports, admin, and settings.
- `src/components`: reusable UI, layout, dashboard, student, attendance, and report components.
- `src/lib/supabase`: server, browser, and middleware Supabase clients using `@supabase/ssr`.
- `src/lib/auth`: session loading and route protection.
- `src/lib/services`: tenant-aware Supabase reads and writes.
- `src/lib/validation`: Zod schemas used before writes.
- `src/lib/permissions.ts`: frontend and server role permission map.
- `supabase/migrations`: PostgreSQL schema, indexes, constraints, views, and RLS policies.
- `supabase/seed.sql`: realistic school data plus optional membership binding for demo Auth users.

## Multi-Tenant Model

Every school-owned table has `school_id`. Users belong to schools through `school_members`, which stores the member role and status. The app reads the active member record after authentication and passes `schoolId` into service queries. Supabase RLS enforces the same isolation at the database layer.

Security helper functions live in the `app` schema:

- `app.can_access_school(school_id)`
- `app.has_school_role(school_id, roles[])`
- `app.is_teacher_for_class(school_id, class_id)`

These functions are used by RLS policies so a user cannot cross tenant boundaries even if they modify client requests.

## Role Model

- `administrator`: system-level school administration, roles, users, settings, academics, all records.
- `principal`: school-wide read access to dashboards, students, staff, attendance summaries, reports, activity.
- `teacher`: assigned classes, assigned students, attendance submission and history.
- `student_staff`: student creation, editing, archival, enrollment assignment, reports.

Role changes are stored only in `school_members` and are protected by administrator-only RLS policies.

## Data Integrity

Important constraints include:

- Unique student admission number per school.
- Unique attendance session per school, class, and date.
- Unique attendance record per school, student, class, and date.
- Normalized academic year, grade, section, subject, class, assignment, enrollment, guardian, and attendance tables.
- Soft archival for students through `status = 'archived'` and `archived_at`.

## Supabase Auth

The app uses Supabase Auth for sessions. Demo school data can exist before Auth users are created. After creating demo users in Supabase Auth, re-run `supabase/seed.sql` to bind those Auth user IDs into `profiles`, `school_members`, and teacher assignments.

Never use the Supabase service-role key in this Next.js application.
