import type { AIResponse, Resource } from "@/types/resources";
import { ResourceCard } from "@/components/ResourceCard";
import { CheckCircle2 } from "lucide-react";

interface AIResponseCardProps {
  data: AIResponse;
  isSaved: (name: string, link: string) => boolean;
  onToggleSave: (resource: Resource) => void;
}

export function AIResponseCard({ data, isSaved, onToggleSave }: AIResponseCardProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Situation summary */}
      <div className="rounded-xl bg-parchment p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-1">Situation Summary</h3>
        <p className="font-body text-foreground text-[15px] leading-relaxed">{data.situationSummary}</p>
      </div>

      {/* Resources */}
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-foreground text-sm">Recommended Resources</h3>
        {data.resources.map((r, i) => (
          <ResourceCard
            key={`${r.name}-${i}`}
            resource={r}
            isSaved={isSaved(r.name, r.link)}
            onToggleSave={() => onToggleSave(r)}
          />
        ))}
      </div>

      {/* Next Steps */}
      {data.nextSteps.length > 0 && (
        <div className="rounded-xl bg-parchment p-5 space-y-2">
          <h3 className="font-heading font-semibold text-foreground text-sm">Next Steps</h3>
          <ol className="space-y-2">
            {data.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <CheckCircle2 className="size-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="font-body text-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
