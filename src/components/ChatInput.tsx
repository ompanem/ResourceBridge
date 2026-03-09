import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, MapPin } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  location: string;
  onLocationChange: (location: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, location, onLocationChange, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border border-border rounded-2xl bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={3}
        placeholder={placeholder || "Describe your situation — we'll help you find the right resources..."}
        className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[15px] font-heading text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
      />
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLocation(!showLocation)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
          >
            <MapPin className="size-3.5" />
            {location ? location : "Add location"}
          </button>
          {showLocation && (
            <input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="City or ZIP"
              className="text-xs bg-secondary rounded-md px-2 py-1 w-32 font-heading text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          )}
        </div>
        <Button
          variant="send"
          size="icon"
          disabled={disabled || !input.trim()}
          onClick={handleSubmit}
          className="size-9"
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );
}
