import { Bus, UserRoundPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/form-field";
import { requireUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { getTransportDashboard } from "@/lib/services/transport";
import {
  assignTransportAction,
  createDriverAction,
  createRouteAction,
  createVehicleAction,
  removeTransportAction
} from "@/app/(app)/transport/actions";

export default async function TransportPage() {
  const user = await requireUser("transport:view");
  const canManage = hasPermission(user.role, "transport:manage", user.permissions);
  const data = await getTransportDashboard(user);

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Transport Dashboard"
        description="Manage routes, drivers, buses, capacity, and student transport billing."
      />

      {data.migrationRequired ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              title="Database migration required"
              description="Apply the latest School OS migration to enable transport routes, vehicles, and passenger assignment."
            />
          </CardContent>
        </Card>
      ) : (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {data.vehicles.length ? (
            data.vehicles.map((vehicle: any) => {
              const capacity = Number(vehicle.seat_capacity || 0);
              const passengers = Number(vehicle.passenger_count || 0);
              const pct = capacity ? Math.min(100, Math.round((passengers / capacity) * 100)) : 0;
              const roster = data.assignments.filter((item) => item.vehicle_id === vehicle.id);
              return (
                <Card key={vehicle.id}>
                  <CardHeader>
                    <div>
                      <CardTitle>{vehicle.plate_number}</CardTitle>
                      <p className="mt-1 text-sm text-muted">{vehicle.route_name ?? "No route mapped"}</p>
                    </div>
                    <Badge tone={vehicle.status === "active" ? "green" : "yellow"}>{vehicle.status}</Badge>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-1 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-ink">{passengers} / {capacity} seats</span>
                        <span className="text-muted">{pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-low">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="grid gap-1 text-sm text-muted">
                      <p><span className="font-semibold text-ink">Driver:</span> {vehicle.driver_name ?? "Unassigned"}</p>
                      <p><span className="font-semibold text-ink">Route:</span> {vehicle.start_point ?? "-"} to {vehicle.end_point ?? "-"}</p>
                      <p><span className="font-semibold text-ink">Fare:</span> {Number(vehicle.monthly_fare || 0).toLocaleString()} / month</p>
                    </div>
                    <div className="rounded-lg bg-surface-low p-3">
                      <p className="mb-2 font-label text-xs font-bold uppercase tracking-wide text-muted">Passengers</p>
                      {roster.length ? (
                        <div className="grid gap-2">
                          {roster.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                              <span>{item.student_name} <span className="text-muted">({item.admission_number})</span></span>
                              {canManage ? (
                                <form action={removeTransportAction}>
                                  <input type="hidden" name="assignment_id" value={item.id} />
                                  <Button type="submit" variant="ghost" size="sm">Remove</Button>
                                </form>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted">No passengers assigned.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="md:col-span-2">
              <EmptyState title="No vehicles yet" description="Add a route, driver, and vehicle to begin assigning students." />
            </div>
          )}
        </div>

        {canManage ? (
          <div className="grid gap-4 content-start">
            <Card>
              <CardHeader>
                <CardTitle>Assign Student</CardTitle>
                <UserRoundPlus className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <form action={assignTransportAction} className="grid gap-3">
                  <Field label="Student">
                    <Select name="student_id" required>
                      <option value="">Choose student</option>
                      {data.students.map((student: any) => (
                        <option key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} / {student.admission_number}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Vehicle">
                    <Select name="vehicle_id" required>
                      <option value="">Choose vehicle</option>
                      {data.vehicles.map((vehicle: any) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate_number} / {vehicle.route_name ?? "No route"}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Button type="submit">Assign to Bus</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Vehicle</CardTitle>
                <Bus className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <form action={createVehicleAction} className="grid gap-3">
                  <Field label="Plate number"><Input name="plate_number" required /></Field>
                  <Field label="Seat capacity"><Input name="seat_capacity" type="number" min="1" required /></Field>
                  <Field label="Driver">
                    <Select name="driver_id">
                      <option value="">Unassigned</option>
                      {data.drivers.map((driver: any) => <option key={driver.id} value={driver.id}>{driver.full_name}</option>)}
                    </Select>
                  </Field>
                  <Field label="Route">
                    <Select name="route_id">
                      <option value="">Unassigned</option>
                      {data.routes.map((route: any) => <option key={route.id} value={route.id}>{route.name}</option>)}
                    </Select>
                  </Field>
                  <Button type="submit">Save Vehicle</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Add Route</CardTitle></CardHeader>
              <CardContent>
                <form action={createRouteAction} className="grid gap-3">
                  <Field label="Route name"><Input name="name" required /></Field>
                  <Field label="Start point"><Input name="start_point" required /></Field>
                  <Field label="End point"><Input name="end_point" required /></Field>
                  <Field label="Monthly fare"><Input name="monthly_fare" type="number" min="0" step="0.01" required /></Field>
                  <Button type="submit">Save Route</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Add Driver</CardTitle></CardHeader>
              <CardContent>
                <form action={createDriverAction} className="grid gap-3">
                  <Field label="Full name"><Input name="full_name" required /></Field>
                  <Field label="Phone"><Input name="phone" required /></Field>
                  <Field label="License number"><Input name="license_number" required /></Field>
                  <Button type="submit">Save Driver</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
      )}
    </>
  );
}
