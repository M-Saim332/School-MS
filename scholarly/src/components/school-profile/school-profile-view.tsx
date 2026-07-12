import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SchoolProfileFormValues } from "@/lib/validation/school";
import type { AppUser } from "@/types/database";

export function SchoolProfileView({ user, profile }: { user: AppUser; profile: SchoolProfileFormValues }) {
  const canEdit = ["principal", "administrator"].includes(user.role);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
          <p className="text-sm text-muted">Primary details about the institution.</p>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-muted">School Name</p>
            <p className="mt-1 font-medium text-ink">{profile.name}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Short Name</p>
            <p className="mt-1 font-medium text-ink">{profile.shortName || "Not set"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-muted">Motto</p>
            <p className="mt-1 font-medium text-ink">{profile.motto || "Not set"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <p className="text-sm text-muted">School logo and favicon.</p>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted">School Logo</p>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-surface-low ring-1 ring-outline/20 overflow-hidden">
              {profile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-muted">No Logo</span>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted">Favicon</p>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-low ring-1 ring-outline/20 overflow-hidden">
              {profile.faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.faviconUrl} alt="Favicon" className="h-full w-full object-contain" />
              ) : (
                <span className="text-[10px] text-muted">No Icon</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <p className="text-sm text-muted">Public contact details for the school.</p>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-muted">Address</p>
            <p className="mt-1 font-medium text-ink">{profile.address || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Phone Number</p>
            <p className="mt-1 font-medium text-ink">{profile.phone || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Email Address</p>
            <p className="mt-1 font-medium text-ink">{profile.email || "Not set"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-muted">Website</p>
            <p className="mt-1 font-medium text-ink">
              {profile.website ? (
                <a href={profile.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {profile.website}
                </a>
              ) : (
                "Not set"
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end pt-4">
          <ButtonLink href="/school-profile/edit">
            Edit School Profile
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
