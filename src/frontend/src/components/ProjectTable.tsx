import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { REGION_VALUES } from "../App";
import type { Project } from "../backend";
import {
  useDeleteProject,
  useGetProjectsByRegion,
  useUpdateProjectField,
} from "../hooks/useQueries";
import { EditHistoryModal } from "./EditHistoryModal";
import { InlineCell } from "./InlineCell";

const EDITABLE_COLUMNS: {
  key: keyof Omit<Project, "id" | "createdAt" | "qnrName" | "region">;
  label: string;
}[] = [
  { key: "projectName", label: "Project Name" },
  { key: "linkStatus", label: "Link Status" },
  { key: "linkComments", label: "Link Comments" },
  { key: "receivedDate", label: "Received Date" },
  { key: "dataStatus", label: "Data Status" },
  { key: "quotaRedirectStatus", label: "Quota/Redirect" },
  { key: "projectLaunchDate", label: "Launch Date" },
  { key: "dataDelivery", label: "Data Delivery" },
];

interface ProjectTableProps {
  region: string;
}

interface HistoryTarget {
  projectId: bigint;
  projectName: string;
  fieldName: string;
}

export function ProjectTable({ region }: ProjectTableProps) {
  const { data: projects, isLoading } = useGetProjectsByRegion(region);
  const { mutateAsync: updateField } = useUpdateProjectField();
  const { mutateAsync: deleteProject } = useDeleteProject();
  const [historyTarget, setHistoryTarget] = useState<HistoryTarget | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const regionOptions = REGION_VALUES[region] ?? [region];

  const handleSave = async (
    project: Project,
    fieldName: string,
    newValue: string,
  ) => {
    try {
      await updateField({
        projectId: project.id,
        fieldName,
        newValue,
        region: project.region,
      });
      toast.success(`Updated ${fieldName}`);
    } catch {
      toast.error(`Failed to update ${fieldName}`);
    }
  };

  const handleDelete = async (project: Project) => {
    if (
      !window.confirm(`Delete "${project.projectName}"? This cannot be undone.`)
    )
      return;
    setDeletingId(project.id);
    try {
      await deleteProject(project.id);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div data-ocid="projects.loading_state" className="space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div
        data-ocid="projects.empty_state"
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Loader2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No projects yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add a project to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div data-ocid="projects.table" className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs font-semibold text-foreground whitespace-nowrap py-2.5 px-3">
                Region
              </TableHead>
              {EDITABLE_COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className="text-xs font-semibold text-foreground whitespace-nowrap py-2.5 px-3"
                >
                  {col.label}
                </TableHead>
              ))}
              <TableHead className="text-xs font-semibold text-foreground py-2.5 px-3">
                QNR Names
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground py-2.5 px-3">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project, idx) => (
              <TableRow
                key={project.id.toString()}
                data-ocid={`projects.item.${idx + 1}`}
                className="hover:bg-muted/20 transition-colors group"
              >
                <TableCell className="py-2 px-3 align-middle">
                  <InlineCell
                    value={project.region}
                    fieldName="region"
                    customOptions={regionOptions}
                    onSave={(newValue) =>
                      handleSave(project, "region", newValue)
                    }
                  />
                </TableCell>

                {EDITABLE_COLUMNS.map((col) => (
                  <TableCell key={col.key} className="py-2 px-3 align-middle">
                    <InlineCell
                      value={project[col.key]}
                      fieldName={col.key}
                      onSave={(newValue) =>
                        handleSave(project, col.key, newValue)
                      }
                    />
                  </TableCell>
                ))}

                <TableCell className="py-2 px-3 align-middle">
                  <div className="flex items-center gap-1">
                    <InlineCell
                      value={project.qnrName}
                      fieldName="qnrName"
                      onSave={(newValue) =>
                        handleSave(project, "qnrName", newValue)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                      title="View QNR Name history"
                      onClick={() =>
                        setHistoryTarget({
                          projectId: project.id,
                          projectName: project.projectName,
                          fieldName: "qnrName",
                        })
                      }
                    >
                      <History className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>

                <TableCell className="py-2 px-3 align-middle">
                  <Button
                    variant="ghost"
                    size="icon"
                    data-ocid={`projects.delete_button.${idx + 1}`}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Delete project"
                    disabled={deletingId === project.id}
                    onClick={() => handleDelete(project)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {historyTarget && (
        <EditHistoryModal
          open={!!historyTarget}
          onClose={() => setHistoryTarget(null)}
          projectId={historyTarget.projectId}
          projectName={historyTarget.projectName}
          fieldName={historyTarget.fieldName}
        />
      )}
    </>
  );
}
