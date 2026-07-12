import { Badge } from "@/components/ui/badge";
import { formatWorkflowStatus, getWorkflowStatusTone } from "@/lib/services/marks";
import type { ResultWorkflowStatus } from "@/types/database";

export function WorkflowStatusBadge({ status }: { status: ResultWorkflowStatus }) {
  return <Badge tone={getWorkflowStatusTone(status)}>{formatWorkflowStatus(status)}</Badge>;
}
