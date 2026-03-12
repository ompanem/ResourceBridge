import { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Languages, AlertTriangle } from "lucide-react";
import { US_STATES, NATIONWIDE_OPTION } from "@/lib/us-states";
import { CategoryButtons } from "@/components/CategoryButtons";

export interface SearchFormData {
  situation: string;
  state: string;
  city: string;
  category: string;
  simplifyLanguage: boolean;
  urgent: boolean;
}

interface SearchFormProps {
  onSubmit: (data: SearchFormData) => void;
  disabled?: boolean;
}

export interface SearchFormHandle {
  setSituation: (v: string) => void;
}

export const SearchForm = forwardRef<SearchFormHandle, SearchFormProps>(({ onSubmit, disabled }, ref) => {
  const [situation, setSituation] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [simplify, setSimplify] = useState(false);
  const [urgent, setUrgent] = useState(false);

  const isNationwide = state === NATIONWIDE_OPTION.label;

  useImperativeHandle(ref, () => ({ setSituation }), []);

  const canSubmit = situation.trim().length > 0 && state.length > 0 && !disabled;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ situation: situation.trim(), state, city: city.trim(), category, simplifyLanguage: simplify, urgent });
    setSituation("");
    setCategory("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCategorySelect = (query: string, cat: string) => {
    setSituation(query);
    setCategory(cat);
  };

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-2xl bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
        {/* Textarea */}
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={3}
          placeholder="Describe your situation — we'll find the right resources..."
          className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[15px] font-heading text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          aria-label="Describe your situation"
        />

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center gap-3 px-4 pb-3">
          {/* State select */}
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="text-sm font-heading bg-secondary text-foreground rounded-lg px-3 py-1.5 border-none focus:outline-none focus:ring-1 focus:ring-primary/30"
            aria-label="Select state"
          >
            <option value="">State *</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.label}>{s.label}</option>
            ))}
          </select>

          {/* City input — disabled when Nationwide */}
          <input
            type="text"
            value={isNationwide ? "" : city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (optional)"
            disabled={isNationwide}
            className="text-sm font-heading bg-secondary text-foreground rounded-lg px-3 py-1.5 w-36 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Enter city"
          />

          {/* Simplify toggle */}
          <button
            type="button"
            onClick={() => setSimplify(!simplify)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors font-heading ${
              simplify
                ? "border-primary text-primary bg-primary/5"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle simplified language"
            aria-label="Toggle simplified language"
          >
            <Languages className="size-3.5" />
            {simplify ? "Simple" : "Simplify"}
          </button>

          {/* Urgent toggle */}
          <button
            type="button"
            onClick={() => setUrgent(!urgent)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors font-heading ${
              urgent
                ? "border-destructive text-destructive bg-destructive/5"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle urgency mode"
            aria-label="Toggle urgency mode"
          >
            <AlertTriangle className="size-3.5" />
            {urgent ? "Urgent" : "Urgent"}
          </button>

          <div className="flex-1" />

          <Button
            variant="send"
            size="icon"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="size-9"
            aria-label="Submit"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>

      {/* Category chips */}
      <CategoryButtons
        onSelect={handleCategorySelect}
        disabled={disabled}
        activeCategory={category}
      />
    </div>
  );
});

SearchForm.displayName = "SearchForm";
