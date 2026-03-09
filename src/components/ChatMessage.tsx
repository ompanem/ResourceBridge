import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  faded?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onRestoreFocus?: () => void;
}

export function ChatMessage({ role, content, faded, isBookmarked, onToggleBookmark, onRestoreFocus }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div
        className={cn(
          "flex justify-end transition-opacity duration-500 cursor-pointer",
          faded && "opacity-50 hover:opacity-100"
        )}
        onClick={faded ? onRestoreFocus : undefined}
      >
        <div className="max-w-[85%] md:max-w-[70%] px-5 py-3 rounded-2xl rounded-br-sm bg-primary text-primary-foreground font-heading text-[15px] leading-relaxed">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex justify-start transition-opacity duration-500 animate-fade-in cursor-pointer",
        faded && "opacity-50 hover:opacity-100"
      )}
      onClick={faded ? onRestoreFocus : undefined}
    >
      <div className="max-w-[90%] md:max-w-[80%] px-6 py-5 rounded-2xl rounded-bl-sm bg-parchment relative group">
        {onToggleBookmark && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors"
            aria-label={isBookmarked ? "Remove bookmark" : "Save response"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="size-5 text-primary" />
            ) : (
              <Bookmark className="size-5" />
            )}
          </button>
        )}
        <div className="font-body text-parchment-foreground text-[15px] leading-[1.75] prose-headings:font-heading prose-headings:text-foreground whitespace-pre-wrap">
          <FormattedResponse content={content} />
        </div>
      </div>
    </div>
  );
}

function FormattedResponse({ content }: { content: string }) {
  // Simple markdown-like rendering
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="font-heading font-semibold text-foreground text-base mt-4 mb-1">
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="font-heading font-semibold text-foreground text-lg mt-5 mb-2">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="font-heading font-bold text-foreground text-lg mt-5 mb-2">
          {trimmed.slice(2)}
        </h2>
      );
    } else if (trimmed.match(/^\d+\.\s/)) {
      elements.push(
        <div key={i} className="ml-1 mb-1 flex gap-2">
          <span className="text-primary font-heading font-semibold min-w-[1.5rem]">
            {trimmed.match(/^(\d+\.)/)?.[1]}
          </span>
          <span><InlineFormat text={trimmed.replace(/^\d+\.\s/, "")} /></span>
        </div>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      elements.push(
        <div key={i} className="ml-1 mb-1 flex gap-2">
          <span className="text-primary mt-1">•</span>
          <span><InlineFormat text={trimmed.slice(2)} /></span>
        </div>
      );
    } else if (trimmed === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="mb-1">
          <InlineFormat text={trimmed} />
        </p>
      );
    }
  });

  return <>{elements}</>;
}

function InlineFormat({ text }: { text: string }) {
  // Handle **bold**, [links](url)
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          return (
            <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
              {linkMatch[1]}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
