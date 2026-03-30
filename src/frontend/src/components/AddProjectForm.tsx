import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { REGION_VALUES } from "../App";
import { useAddProject } from "../hooks/useQueries";

const LINK_STATUS_OPTIONS = ["Draft", "Live", "Closed"];
const DATA_STATUS_OPTIONS = ["Pending", "WIP", "Completed"];
const QUOTA_STATUS_OPTIONS = ["Not Received", "Pending", "Completed"];

interface AddProjectFormProps {
  open: boolean;
  onClose: () => void;
  region: string;
}

interface FormData {
  regionValue: string;
  projectName: string;
  linkStatus: string;
  linkComments: string;
  qnrName: string;
  receivedDate: string;
  dataStatus: string;
  quotaRedirectStatus: string;
  projectLaunchDate: string;
  dataDelivery: string;
}

export function AddProjectForm({ open, onClose, region }: AddProjectFormProps) {
  const regionOptions = REGION_VALUES[region] ?? [region];

  const [form, setForm] = useState<FormData>({
    regionValue: regionOptions[0],
    projectName: "",
    linkStatus: "Draft",
    linkComments: "",
    qnrName: "",
    receivedDate: "",
    dataStatus: "Pending",
    quotaRedirectStatus: "Not Received",
    projectLaunchDate: "",
    dataDelivery: "",
  });

  const { mutateAsync, isPending } = useAddProject();

  const set = (field: keyof FormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectName.trim()) {
      toast.error("Project Name is required");
      return;
    }
    try {
      await mutateAsync({
        id: 0n,
        region: form.regionValue,
        projectName: form.projectName,
        linkStatus: form.linkStatus,
        linkComments: form.linkComments,
        qnrName: form.qnrName,
        receivedDate: form.receivedDate,
        dataStatus: form.dataStatus,
        quotaRedirectStatus: form.quotaRedirectStatus,
        projectLaunchDate: form.projectLaunchDate,
        dataDelivery: form.dataDelivery,
        createdAt: 0n,
      });
      toast.success("Project added successfully");
      setForm({
        regionValue: regionOptions[0],
        projectName: "",
        linkStatus: "Draft",
        linkComments: "",
        qnrName: "",
        receivedDate: "",
        dataStatus: "Pending",
        quotaRedirectStatus: "Not Received",
        projectLaunchDate: "",
        dataDelivery: "",
      });
      onClose();
    } catch {
      toast.error("Failed to add project");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="add_project.dialog" className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Add Project – {region}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Region</Label>
              {regionOptions.length > 1 ? (
                <Select
                  value={form.regionValue}
                  onValueChange={set("regionValue")}
                >
                  <SelectTrigger
                    data-ocid="add_project.region.select"
                    className="mt-1 text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={form.regionValue}
                  disabled
                  className="mt-1 bg-muted text-sm"
                />
              )}
            </div>
            <div>
              <Label htmlFor="projectName" className="text-xs font-medium">
                Project Name *
              </Label>
              <Input
                id="projectName"
                data-ocid="add_project.input"
                value={form.projectName}
                onChange={(e) => set("projectName")(e.target.value)}
                placeholder="Enter project name"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Link Status</Label>
              <Select value={form.linkStatus} onValueChange={set("linkStatus")}>
                <SelectTrigger
                  data-ocid="add_project.link_status.select"
                  className="mt-1 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LINK_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="qnrName" className="text-xs font-medium">
                QNR Name
              </Label>
              <Input
                id="qnrName"
                data-ocid="add_project.qnr_name.input"
                value={form.qnrName}
                onChange={(e) => set("qnrName")(e.target.value)}
                placeholder="QNR identifier"
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="linkComments" className="text-xs font-medium">
              Link Comments
            </Label>
            <Input
              id="linkComments"
              data-ocid="add_project.link_comments.input"
              value={form.linkComments}
              onChange={(e) => set("linkComments")(e.target.value)}
              placeholder="Optional comments about the link"
              className="mt-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="receivedDate" className="text-xs font-medium">
                Received Date
              </Label>
              <Input
                id="receivedDate"
                data-ocid="add_project.received_date.input"
                type="date"
                value={form.receivedDate}
                onChange={(e) => set("receivedDate")(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Data Status</Label>
              <Select value={form.dataStatus} onValueChange={set("dataStatus")}>
                <SelectTrigger
                  data-ocid="add_project.data_status.select"
                  className="mt-1 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">
                Quota/Redirect Status
              </Label>
              <Select
                value={form.quotaRedirectStatus}
                onValueChange={set("quotaRedirectStatus")}
              >
                <SelectTrigger
                  data-ocid="add_project.quota_status.select"
                  className="mt-1 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUOTA_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="projectLaunchDate"
                className="text-xs font-medium"
              >
                Project Launch Date
              </Label>
              <Input
                id="projectLaunchDate"
                data-ocid="add_project.launch_date.input"
                type="date"
                value={form.projectLaunchDate}
                onChange={(e) => set("projectLaunchDate")(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dataDelivery" className="text-xs font-medium">
              Data Delivery
            </Label>
            <Input
              id="dataDelivery"
              data-ocid="add_project.data_delivery.input"
              type="date"
              value={form.dataDelivery}
              onChange={(e) => set("dataDelivery")(e.target.value)}
              className="mt-1 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              data-ocid="add_project.cancel_button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-md hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-ocid="add_project.submit_button"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Adding..." : "Add Project"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
