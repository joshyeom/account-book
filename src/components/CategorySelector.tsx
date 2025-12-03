import { cn } from "@/lib/utils";
import { categories, type Category } from "@/lib/data";

interface CategorySelectorProps {
  selected: string | null;
  onSelect: (categoryId: string) => void;
}

export const CategorySelector = ({ selected, onSelect }: CategorySelectorProps) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selected === category.id;
        
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl p-3 transition-all",
              "border-2",
              isSelected
                ? "border-primary bg-accent"
                : "border-transparent bg-secondary hover:bg-muted"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                isSelected ? "bg-card" : "bg-card"
              )}
              style={{ backgroundColor: `${category.color}20` }}
            >
              <Icon className="h-5 w-5" style={{ color: category.color }} />
            </div>
            <span className={cn(
              "text-xs font-medium",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}>
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
