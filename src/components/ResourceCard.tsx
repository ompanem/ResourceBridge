import { Bookmark, BookmarkCheck, ExternalLink, Copy, Check, ClipboardList, Zap, Clock, CalendarClock, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { Resource } from "@/types/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResourceCardProps {
  resource: Resource;
  isSaved: boolean;
  onToggleSave: () => void;
}

const relevanceBadgeStyles: Record<string, string> = {
  Local: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Statewide: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  National: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  Online: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

const urgencyConfig: Record<string, { style: string; icon: typeof Zap }> = {
  "Immediate Help": { style: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20", icon: Zap },
  "Same-Day Help": { style: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20", icon: Clock },
  "Short-Term Support": { style: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20", icon: CalendarClock },
  "Long-Term Support": { style: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20", icon: TrendingUp },
};

export function ResourceCard({ resource, isSaved, onToggleSave }: ResourceCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `${resource.name}\n${resource.description}${resource.link ? `\n${resource.link}` : ""}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeStyle = relevanceBadgeStyles[resource.relevanceLevel] || "";
  const urgency = resource.urgencyLevel ? urgencyConfig[resource.urgencyLevel] : null;
  const UrgencyIcon = urgency?.icon;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <h3 className="font-heading font-bold text-foreground text-lg leading-tight">{resource.name || "Resource"}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-xs font-heading">{resource.category}</Badge>
            {resource.relevanceLevel && (
              <span className={`inline-flex items-center text-[11px] font-heading font-semibold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                {resource.relevanceLevel}
              </span>
            )}
            {resource.urgencyLevel && urgency && UrgencyIcon && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-heading font-semibold px-2 py-0.5 rounded-full border ${urgency.style}`}>
                <UrgencyIcon className="size-3" />
                {resource.urgencyLevel}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" className="size-8" onClick={handleCopy} aria-label="Copy resource">
            {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={onToggleSave} aria-label={isSaved ? "Remove bookmark" : "Save resource"}>
            {isSaved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
          </Button>
        </div>
      </div>

      <p className="font-body text-sm text-foreground leading-relaxed">{resource.description}</p>

      <div className="space-y-1.5 text-sm">
        <p className="text-muted-foreground">
          <span className="font-heading font-medium text-foreground">Why this helps: </span>
          {resource.whyThisHelps}
        </p>
        <p className="text-muted-foreground">
          <span className="font-heading font-medium text-foreground">Location: </span>
          {resource.locationRelevance}
        </p>
      </div>

      {/* What You May Need */}
      {resource.whatYouMayNeed && resource.whatYouMayNeed.length > 0 && (
        <div className="rounded-lg bg-secondary/50 px-4 py-3 space-y-1.5">
          <p className="flex items-center gap-1.5 font-heading font-medium text-foreground text-xs">
            <ClipboardList className="size-3.5" />
            What you may need
          </p>
          <div className="flex flex-wrap gap-1.5">
            {resource.whatYouMayNeed.map((item, i) => (
              <span key={i} className="text-[11px] font-heading bg-background text-muted-foreground rounded-md px-2 py-0.5 border border-border">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {resource.link ? (
        <a
          href={resource.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-heading font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Visit website <ExternalLink className="size-3.5" />
        </a>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-sm font-heading text-muted-foreground">
          Official site unavailable
        </span>
      )}
    </div>
  );
}
