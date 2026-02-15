'use client';

interface FilterOption {
  label: string;
  value: string;
}

interface Props {
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

export default function FilterChips({ options, selected, onToggle }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-1">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            className={`whitespace-nowrap px-3 py-1 rounded-full border text-sm font-medium transition-colors ${
              active
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-bg-card text-text-secondary hover:border-border-light'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
