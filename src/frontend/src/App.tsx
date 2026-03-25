import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AddProjectForm } from "./components/AddProjectForm";
import { HomeView } from "./components/HomeView";
import { ProjectTable } from "./components/ProjectTable";
import { Sidebar } from "./components/Sidebar";

const REGIONS = ["Healthcare", "Insightz", "Middle East", "Europe"] as const;
type Region = (typeof REGIONS)[number];
type SubView = "home" | "track" | "add";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [activeRegion, setActiveRegion] = useState<Region>("Healthcare");
  const [subView, setSubView] = useState<SubView>("home");
  const [showAddProject, setShowAddProject] = useState(false);

  const handleRegionChange = (region: Region) => {
    setActiveRegion(region);
    setSubView("home");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main content */}
      <main className="flex-1 ml-[240px] min-h-screen flex flex-col">
        {/* Page header */}
        <header className="bg-card border-b border-border px-8 py-5">
          <h1 className="text-[28px] font-semibold text-foreground leading-tight">
            Project Tracking Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage projects across all regions
          </p>
        </header>

        <div className="flex-1 px-8 py-6">
          {/* Region tabs */}
          <div className="bg-card border border-border rounded-lg shadow-xs inline-flex p-1 mb-6">
            {REGIONS.map((region) => (
              <button
                type="button"
                key={region}
                data-ocid={`regions.${region.toLowerCase().replace(/ /g, "_")}.tab`}
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

          {/* Sub-navigation */}
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

          {/* Active view */}
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
                    Click any cell to edit inline. Use the clock icon to view
                    edit history.
                  </p>
                </div>
                <ProjectTable region={activeRegion} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Project Modal */}
      <AddProjectForm
        open={showAddProject}
        onClose={() => setShowAddProject(false)}
        region={activeRegion}
      />

      <Toaster />
    </div>
  );
}
