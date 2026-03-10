import { X, ExternalLink, Trash2, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SavedResource } from "@/types/resources";
import { Badge } from "@/components/ui/badge";

interface SavedResourcesPanelProps {
  saved: SavedResource[];
  onRemove: (name: string, link: string) => void;
  open: boolean;
  onClose: () => void;
}

export function SavedResourcesPanel({ saved, onRemove, open, onClose }: SavedResourcesPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md bg-background border-l border-border h-full overflow-y-auto animate-fade-in">
        <div className="sticky top-0 bg-background border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="size-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground text-lg">Saved Resources</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close saved resources">
            <X className="size-5" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {saved.length === 0 && (
            <div className="text-center py-12">
              <BookmarkCheck className="size-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-heading text-muted-foreground text-sm">No saved resources yet.</p>
              <p className="font-body text-muted-foreground text-xs mt-1">Click the bookmark icon on any resource to save it.</p>
            </div>
          )}

          {saved.map((r) => (
            <div key={`${r.name}-${r.link}`} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading font-semibold text-foreground text-sm">{r.name}</h3>
                  <Badge variant="secondary" className="text-xs mt-1">{r.category}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(r.name, r.link)}
                  aria-label="Remove saved resource"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <p className="font-body text-xs text-muted-foreground leading-relaxed">{r.description}</p>
              <a
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-heading font-medium text-primary hover:text-primary/80"
              >
                Visit <ExternalLink className="size-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
