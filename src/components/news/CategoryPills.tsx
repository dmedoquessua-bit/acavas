interface Props {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
}

/** Horizontally scrollable pill filter bar. */
const CategoryPills = ({ categories, value, onChange }: Props) => (
  <div className="-mx-6 px-6 lg:mx-0 lg:px-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div className="flex gap-2 w-max pb-1">
      {["all", ...categories].map((c) => {
        const active = value === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-pressed={active}
            className={`whitespace-nowrap text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-colors duration-300 font-light ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {c === "all" ? "Todas" : c}
          </button>
        );
      })}
    </div>
  </div>
);

export default CategoryPills;
