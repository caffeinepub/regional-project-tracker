import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "../backend";
import {
  useGetProjectsByRegion,
  useUpdateProjectField,
} from "../hooks/useQueries";
import { InlineCell } from "./InlineCell";

const COLUMNS: {
  key: keyof Omit<Project, "id" | "createdAt" | "qnrName">;
  label: string;
}[] = [
  { key: "region", label: "Region" },
  { key: "projectName", label: "Project Name" },
  { key: "linkStatus", label: "Link Status" },
  { key: "receivedDate", label: "Received Date" },
  { key: "dataStatus", label: "Data Status" },
  { key: "quotaRedirectStatus", label: "Quota/Redirect" },
  { key: "projectLaunchDate", label: "Launch Date" },
  { key: "dataDelivery", label: "Data Delivery" },
];

interface ProjectTableProps {
  region: string;
}

export function ProjectTable({ region }: ProjectTableProps) {
  const { data: projects, isLoading } = useGetProjectsByRegion(region);
  const { mutateAsync: updateField } = useUpdateProjectField();

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
    <div data-ocid="projects.table" className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            {COLUMNS.map((col) => (
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project, idx) => (
            <TableRow
              key={project.id.toString()}
              data-ocid={`projects.item.${idx + 1}`}
              className="hover:bg-muted/20 transition-colors group"
            >
              {COLUMNS.map((col) => (
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
                <InlineCell
                  value={project.qnrName}
                  fieldName="qnrName"
                  onSave={(newValue) =>
                    handleSave(project, "qnrName", newValue)
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
