import { useState, useRef, useEffect } from "react";

const COUNTRIES = [
  { code: "+995", flag: "🇬🇪", name: "Georgia" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+972", flag: "🇮🇱", name: "Israel" },
  { code: "+380", flag: "🇺🇦", name: "Ukraine" },
  { code: "+48", flag: "🇵🇱", name: "Poland" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+91", flag: "🇮🇳", name: "India" },
];

interface PhoneInputProps {
  name: string;
  placeholder?: string;
  className?: string;
}

export const PhoneInput = ({ name, placeholder, className }: PhoneInputProps) => {
  const [selected, setSelected] = useState(COUNTRIES[0]);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={phone ? `${selected.code}${phone}` : ""} />
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 pr-2 text-sm shrink-0 border-0 bg-transparent"
        >
          <span className="text-base">{selected.flag}</span>
          <span className="text-xs text-muted-foreground">{selected.code}</span>
          <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d\s-]/g, ""))}
          placeholder={placeholder}
          autoComplete="tel-national"
          className={className}
        />
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-50 max-h-48 overflow-y-auto min-w-[200px]">
          {COUNTRIES.map((c) => (
            <button
              key={c.code + c.name}
              type="button"
              onClick={() => { setSelected(c); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors ${
                selected.code === c.code ? "text-primary font-medium" : "text-card-foreground"
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
              <span className="text-muted-foreground ml-auto">{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
