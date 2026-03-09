import { Button } from "@/components/ui/button";
import { GraduationCap, Apple, Heart, Award, Scale, Briefcase } from "lucide-react";

const categories = [
  { label: "Education Programs", icon: GraduationCap, query: "I'm looking for free education programs and learning opportunities." },
  { label: "Food Assistance", icon: Apple, query: "My family needs help with food assistance and nutrition programs." },
  { label: "Mental Health", icon: Heart, query: "I need help finding mental health support and counseling services." },
  { label: "Scholarships", icon: Award, query: "I'm looking for scholarships and financial aid for education." },
  { label: "Legal Help", icon: Scale, query: "I need free or low-cost legal assistance and advice." },
  { label: "Job Training", icon: Briefcase, query: "I'm looking for job training programs and career development resources." },
];

interface CategoryButtonsProps {
  onSelect: (query: string) => void;
  disabled?: boolean;
}

export function CategoryButtons({ onSelect, disabled }: CategoryButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((cat) => (
        <Button
          key={cat.label}
          variant="category"
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(cat.query)}
          className="gap-2"
        >
          <cat.icon className="size-4" />
          {cat.label}
        </Button>
      ))}
    </div>
  );
}
