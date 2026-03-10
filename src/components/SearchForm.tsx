import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Languages } from "lucide-react";
import { US_STATES } from "@/lib/us-states";
import { CategoryButtons } from "@/components/CategoryButtons";

export interface SearchFormData {
  situation: string;
  state: string;
  city: string;
  category: string;
  simplifyLanguage: boolean;
}

interface SearchFormProps {
  onSubmit: (data: SearchFormData) => void;
  disabled?: boolean;
}

export function SearchForm({ onSubmit, disabled }: SearchFormProps) {
  const [situation, setSituation] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [simplify, setSimplify] = useState(false);

  const canSubmit = situation.trim().length > 0 && state.length > 0 && !disabled;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ situation: situation.trim(), state, city: city.trim(), category, simplifyLanguage: simplify });
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

          {/* City input */}
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (optional)"
            className="text-sm font-heading bg-secondary text-foreground rounded-lg px-3 py-1.5 w-36 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
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
}
