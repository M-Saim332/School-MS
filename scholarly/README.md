# Scholarly

Scholarly is a complete multi-tenant school management SaaS application for principals, teachers, student-management staff, and administrators. It uses Next.js, TypeScript, Supabase Auth, Supabase PostgreSQL, Supabase RLS, Tailwind CSS, Zod, React Hook Form, and Recharts.

## Main Features

- Supabase Auth sign in, sign out, forgot password, reset password, protected routes, and role-aware redirect.
- Role-based dashboards for principals, administrators, student-management staff, and teachers.
- Student management with list, search, filters, profiles, add/edit forms, guardian details, attendance summary, and soft archival.
- Attendance workflow with class/date selection, status marking, notes, duplicate-safe upserts, and teacher assignment scoping.
- Teacher and staff directory with roles, departments, statuses, and assigned-class summaries.
- Academic structure for years, grades, classes, sections, subjects, assignments, and enrollments.
- Reports for attendance, enrollment counts, archived students, and activity logs with CSV export.
- Activity logging for important actions.
- Multi-school tenant isolation using `school_id` plus Supabase Row Level Security.

## Technology Stack

- Runtime: Node.js
- Framework: Next.js App Router with TypeScript
- Styling: Tailwind CSS
- Auth: Supabase Auth
- Database: Supabase PostgreSQL
- Validation: Zod
- Forms: React Hook Form
- Charts: Recharts
- Tests: Vitest

## Project Structure

```text
src/
  app/                    Next.js routes
  components/             UI, layout, dashboards, students, attendance, reports
  lib/
    auth/                 session and route guards
    services/             Supabase data access and writes
    supabase/             server/browser/middleware clients
    validation/           Zod schemas
    permissions.ts        role permissions
  types/
supabase/
  migrations/
  seed.sql
ARCHITECTURE.md
```

## Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project
- Supabase CLI is recommended for local migrations, but Docker is optional and not required by this repository

## Environment Variables

Create `.env.local` from `.env.example`.

```powershell
Copy-Item .env.example .env.local
```

macOS Terminal:

```bash
cp .env.example .env.local
```

Fill in:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Do not add a service-role key to frontend environment variables.

## Install Dependencies

Windows PowerShell:

```powershell
npm.cmd install
```

macOS Terminal:

```bash
npm install
```

## Supabase Setup

1. Create a Supabase project.
2. Copy the project URL and anon key into `.env.local`.
3. Apply the migration in `supabase/migrations/202607110001_initial_schema.sql`.
4. Run `supabase/seed.sql` for demo school, academic structure, students, guardians, enrollments, and activity logs.
5. Create demo Auth users in Supabase Auth, then re-run `supabase/seed.sql` so the final block can bind their Auth IDs to school memberships.

Suggested demo users:

```text
principal@scholarly.test
admin@scholarly.test
teacher@scholarly.test
staff@scholarly.test
```

Use secure temporary passwords in Supabase Auth. Do not commit credentials.

## Row Level Security

The migration enables RLS on every tenant-owned table. The core policies use:

- `app.can_access_school(school_id)`
- `app.has_school_role(school_id, roles[])`
- `app.is_teacher_for_class(school_id, class_id)`

Teachers can only read assigned-class students and submit attendance for assigned classes. Student-management staff can create, update, and archive students. Administrators can manage users, academic structure, and settings.

## Local Development

Windows PowerShell:

```powershell
npm.cmd run dev
```

macOS Terminal:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Build

Windows PowerShell:

```powershell
npm.cmd run build
npm.cmd run start
```

macOS Terminal:

```bash
npm run build
npm run start
```

## Testing, Linting, and Type Checking

Windows PowerShell:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
```

macOS Terminal:

```bash
npm run typecheck
npm run lint
npm run test
```

## Deployment

Deploy to any Node-compatible host that supports Next.js, such as Vercel, Netlify, or a managed Node server. Configure the same environment variables in the hosting dashboard. Supabase migrations should be applied before exposing the app to users.

## Security Considerations

- RLS is the source of truth for tenant isolation.
- Server route guards check permissions before protected pages render.
- Zod validates student and attendance writes.
- Destructive student actions are soft archival and require confirmation.
- Attendance duplicate prevention is enforced by a database unique constraint.
- Role changes are protected by administrator-only policies.
- User-provided content is rendered as text, not HTML.
- No secrets are committed; `.env.example` contains placeholders only.

## Common Troubleshooting

- If sign-in succeeds but redirects back to sign in, verify the Auth user has a matching `profiles` and active `school_members` row.
- If a teacher sees no classes, confirm `teacher_assignments` has rows for that teacher’s Auth user ID.
- If student creation fails, check the current user role and the `students_insert_staff` RLS policy.
- If charts are empty, submit attendance records or add enrollments first.
- If PowerShell blocks `npm`, use `npm.cmd` as shown above.

## Remaining Operational Notes

The application does not create Auth users from the browser because that requires privileged Supabase Admin APIs. Create or invite users through Supabase Auth, then assign school membership in the database or an administrator-only server route backed by a secure server environment.
