import { MessageCircle, Lightbulb } from "lucide-react";
import type { AIResponse } from "@/types/resources";

interface GuidanceCardProps {
  data: AIResponse;
  onPromptClick: (prompt: string) => void;
}

export function GuidanceCard({ data, onPromptClick }: GuidanceCardProps) {
  const isGuidance = data.mode === "guidance";
  const Icon = isGuidance ? Lightbulb : MessageCircle;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-xl bg-parchment p-5 flex gap-3 items-start">
        <Icon className="size-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="font-body text-foreground text-[15px] leading-relaxed">
          {data.message}
        </p>
      </div>

      {data.suggestedPrompts && data.suggestedPrompts.length > 0 && (
        <div className="space-y-2">
          <p className="font-heading text-xs text-muted-foreground font-medium">Try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {data.suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onPromptClick(prompt)}
                className="text-sm font-heading px-4 py-2 rounded-full border border-border bg-card text-foreground hover:bg-secondary hover:border-primary/30 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
