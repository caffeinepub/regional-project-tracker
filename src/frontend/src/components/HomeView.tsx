import { ArrowRight, FolderKanban } from "lucide-react";
import { useGetProjectsByRegion } from "../hooks/useQueries";

interface HomeViewProps {
  region: string;
  onTrackRegion: () => void;
}

const REGION_DESCRIPTIONS: Record<string, string> = {
  Healthcare:
    "Monitor and manage healthcare research projects across clinical and non-clinical programs, tracking data collection timelines and delivery milestones.",
  Insightz:
    "Oversee Insightz platform projects including quantitative and qualitative research studies, quota management, and data delivery workflows.",
  "Middle East":
    "Track research projects spanning GCC and MENA markets, with visibility into localized fieldwork, QNR status, and regional data deliveries.",
  Europe:
    "Manage European market research initiatives, including GDPR-compliant data handling, multi-country fieldwork, and cross-border quota management.",
};

export function HomeView({ region, onTrackRegion }: HomeViewProps) {
  const { data: projects } = useGetProjectsByRegion(region);
  const total = projects?.length ?? 0;
  const draft = projects?.filter((p) => p.linkStatus === "Draft").length ?? 0;
  const live = projects?.filter((p) => p.linkStatus === "Live").length ?? 0;
  const closed = projects?.filter((p) => p.linkStatus === "Closed").length ?? 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl border border-border shadow-card p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FolderKanban className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{region}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {REGION_DESCRIPTIONS[region] ??
                "Manage and track projects for this region."}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-8">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{total}</div>
            <div className="text-xs text-muted-foreground mt-1">Total</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{draft}</div>
            <div className="text-xs text-amber-600 mt-1">Draft</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-700">{live}</div>
            <div className="text-xs text-emerald-600 mt-1">Live</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-600">{closed}</div>
            <div className="text-xs text-slate-500 mt-1">Closed</div>
          </div>
        </div>

        <button
          type="button"
          data-ocid="home.track_region.button"
          onClick={onTrackRegion}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Track Region
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
