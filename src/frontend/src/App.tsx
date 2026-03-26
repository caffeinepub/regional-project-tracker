import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AddProjectForm } from "./components/AddProjectForm";
import { HomeView } from "./components/HomeView";
import { ProjectTable } from "./components/ProjectTable";

export const REGIONS = [
  "Healthcare",
  "Insightz",
  "Middle East",
  "Europe",
  "Internal (SG)",
] as const;
export type Region = (typeof REGIONS)[number];

export const REGION_VALUES: Record<string, string[]> = {
  Healthcare: ["Healthcare", "Noram"],
  Insightz: ["Insightz"],
  "Middle East": ["Middle East", "COE"],
  Europe: ["Europe", "Mckinsey"],
  "Internal (SG)": ["Internal (SG)"],
};

type SubView = "home" | "track" | "add";

export default function App() {
  const [activeRegion, setActiveRegion] = useState<Region>("Healthcare");
  const [subView, setSubView] = useState<SubView>("home");
  const [showAddProject, setShowAddProject] = useState(false);

  const handleRegionChange = (region: Region) => {
    setActiveRegion(region);
    setSubView("home");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border px-8 py-5">
        <h1 className="text-[28px] font-semibold text-foreground leading-tight">
          BA Research operations - Project Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track and manage projects across all regions
        </p>
      </header>

      <main className="flex-1 px-8 py-6">
        <div className="bg-card border border-border rounded-lg shadow-xs inline-flex flex-wrap p-1 mb-6 gap-1">
          {REGIONS.map((region) => (
            <button
              type="button"
              key={region}
              data-ocid={`regions.${region.toLowerCase().replace(/ /g, "_").replace(/[()]/g, "")}.tab`}
              onClick={() => handleRegionChange(region)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeRegion === region
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            data-ocid="subnav.home.button"
            onClick={() => setSubView("home")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              subView === "home"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            Home
          </button>
          <button
            type="button"
            data-ocid="subnav.track_region.button"
            onClick={() => setSubView("track")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              subView === "track"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            Track Region
          </button>
          <button
            type="button"
            data-ocid="subnav.add_project.button"
            onClick={() => setShowAddProject(true)}
            className="px-4 py-2 rounded-md text-sm font-medium border border-primary bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            + Add Project
          </button>
        </div>

        <div>
          {subView === "home" && (
            <HomeView
              region={activeRegion}
              onTrackRegion={() => setSubView("track")}
            />
          )}
          {subView === "track" && (
            <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">
                  {activeRegion} — All Projects
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click any cell to edit inline. Use the clock icon to view edit
                  history.
                </p>
              </div>
              <ProjectTable region={activeRegion} />
            </div>
          )}
        </div>
      </main>

      <AddProjectForm
        open={showAddProject}
        onClose={() => setShowAddProject(false)}
        region={activeRegion}
      />

      <Toaster />
    </div>
  );
}
