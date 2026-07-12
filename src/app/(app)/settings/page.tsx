import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form-field";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  await requireUser("settings:manage");
  return (
    <>
      <PageHeader eyebrow="Configuration" title="School Settings" description="School-level settings are stored in `school_settings` and isolated by `school_id`." />
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="School display name">
            <Input defaultValue="Alexandria Academy" />
          </Field>
          <Field label="Default academic year">
            <Select defaultValue="2026-2027">
              <option>2026-2027</option>
              <option>2027-2028</option>
            </Select>
          </Field>
          <Field label="Attendance edit window">
            <Input defaultValue="7 days" />
          </Field>
          <Field label="Locale">
            <Input defaultValue="en-US" />
          </Field>
        </CardContent>
      </Card>
    </>
  );
}
