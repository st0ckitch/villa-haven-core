import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/MagneticButton";
import { useLanguage, Language, languageNames } from "@/contexts/LanguageContext";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [villaOpen, setVillaOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const projectsRef = useRef<HTMLDivElement>(null);
  const villaRef = useRef<HTMLDivElement>(null);
  const projectsTimeout = useRef<ReturnType<typeof setTimeout>>();
  const villaTimeout = useRef<ReturnType<typeof setTimeout>>();

  const compactNav = language === "ka" || language === "ru";
  const navGap = compactNav ? "gap-5 xl:gap-6" : "gap-8";
  const navText = compactNav ? "text-xs" : "text-sm";
  const rightGap = compactNav ? "gap-3" : "gap-4";

  const projectSubLinks = [
    { label: t("footer.polograph"), to: "/polograph" },
    { label: t("footer.olimpo"), to: "/olimpo" },
    { label: t("footer.equestrian"), to: "/ipodromi" },
  ];

  // Two-item dropdown under the navbar's "Choose" entry:
  //   1. Choose Plot     → /site-plan (the interactive plot map)
  //   2. Choose Villa    → /villas    (new index page, client PDF Q1)
  // Old layout duplicated /site-plan for both — client PDF 2026-05-31
  // wants the second item to land on the villa-grid page instead.
  const villaSubLinks = [
    { label: t("nav.navChoosePlot"), to: "/site-plan" },
    { label: t("nav.chooseCondominium"), to: "/villas" },
  ];

  const navLinks = [
    { label: t("nav.chooseVilla"), to: "/site-plan", hasDropdown: "villa" },
    { label: t("nav.projects"), to: "#", hasDropdown: "projects" },
    { label: t("nav.aboutUs"), to: "/about" },
    { label: t("nav.news"), to: "/blog" },
    { label: t("nav.gallery"), to: "/gallery" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  const handleLangSelect = (lang: Language) => {
    setLanguage(lang);
    setLangOpen(false);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (projectsRef.current && !projectsRef.current.contains(e.target as Node)) setProjectsOpen(false);
      if (villaRef.current && !villaRef.current.contains(e.target as Node)) setVillaOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const renderDropdown = (items: { label: string; to: string }[]) => (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white/70 backdrop-blur-2xl border border-white/30 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] py-1 min-w-[180px] z-50">
      {items.map((item) => (
        <Link
          key={item.to + item.label}
          to={item.to}
          className="font-mtavruli block px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
          onClick={() => { setProjectsOpen(false); setVillaOpen(false); }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[1200px]">
      <div className="bg-background/70 backdrop-blur-xl border border-border/30 rounded-full px-6 flex items-center justify-between h-14 lg:h-16 shadow-lg">
        <Link to="/" className="font-serif text-xl lg:text-2xl tracking-tight text-foreground">
          Polograph<span className="text-primary">.</span>
        </Link>

        <nav className={`hidden lg:flex items-center ${navGap}`}>
          {navLinks.map((link) => {
            if (link.hasDropdown === "projects") {
              return (
                <div
                  key="projects"
                  ref={projectsRef}
                  className="relative"
                  onMouseEnter={() => { clearTimeout(projectsTimeout.current); setProjectsOpen(true); }}
                  onMouseLeave={() => { projectsTimeout.current = setTimeout(() => setProjectsOpen(false), 150); }}
                >
                  <button
                    className={`font-mtavruli font-medium ${navText} tracking-wide transition-colors hover:text-primary flex items-center gap-1 ${
                      ["/polograph", "/olimpo", "/equestrian", "/ipodromi"].some((p) => location.pathname.startsWith(p)) ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {link.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {projectsOpen && renderDropdown(projectSubLinks)}
                </div>
              );
            }
            if (link.hasDropdown === "villa") {
              return (
                <div
                  key="villa"
                  ref={villaRef}
                  className="relative"
                  onMouseEnter={() => { clearTimeout(villaTimeout.current); setVillaOpen(true); }}
                  onMouseLeave={() => { villaTimeout.current = setTimeout(() => setVillaOpen(false), 150); }}
                >
                  <Link
                    to={link.to}
                    className={`font-mtavruli font-medium ${navText} tracking-wide transition-colors hover:text-primary flex items-center gap-1 ${
                      location.pathname === "/site-plan" ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {link.label}
                    <ChevronDown className="w-3 h-3" />
                  </Link>
                  {villaOpen && renderDropdown(villaSubLinks)}
                </div>
              );
            }
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`font-mtavruli font-medium ${navText} tracking-wide transition-colors hover:text-primary ${
                  location.pathname === link.to ? "text-primary" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={`hidden lg:flex items-center ${rightGap}`}>
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-card-foreground transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{languageNames[language]}</span>
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white/70 backdrop-blur-2xl border border-white/30 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] py-1 min-w-[80px] z-50">
                {(["ka", "en", "ru"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLangSelect(lang)}
                    className={`w-full text-left px-4 py-2 text-sm font-sans transition-colors hover:bg-muted ${
                      language === lang ? "text-primary font-medium" : "text-card-foreground"
                    }`}
                  >
                    {languageNames[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-card-foreground transition-colors">
            <MapPin className="w-4 h-4" />
            <span>{t("nav.location")}</span>
          </button>
          <MagneticButton strength={0.3}>
            <Link to="/contact">
              <Button size="sm" className="rounded-full gap-1.5">
                {t("nav.leaveRequest")}
              </Button>
            </Link>
          </MagneticButton>
        </div>

        <button className="lg:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-background/90 backdrop-blur-xl border border-border/30 rounded-2xl mt-2 mx-2 shadow-xl">
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
            <Link to="/site-plan" onClick={() => setIsOpen(false)} className="font-mtavruli font-medium text-base text-foreground hover:text-primary transition-colors">
              {t("nav.chooseVilla")}
            </Link>

            {/* Projects group */}
            <div className="pl-0">
              <p className="font-mtavruli font-medium text-base text-foreground mb-2">{t("nav.projects")}</p>
              <div className="pl-4 flex flex-col gap-2">
                {projectSubLinks.map((sub) => (
                  <Link
                    key={sub.to + sub.label}
                    to={sub.to}
                    onClick={() => setIsOpen(false)}
                    className="font-mtavruli text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/about" onClick={() => setIsOpen(false)} className="font-mtavruli font-medium text-base text-foreground hover:text-primary transition-colors">
              {t("nav.aboutUs")}
            </Link>
            <Link to="/blog" onClick={() => setIsOpen(false)} className="font-mtavruli font-medium text-base text-foreground hover:text-primary transition-colors">
              {t("nav.news")}
            </Link>
            <Link to="/gallery" onClick={() => setIsOpen(false)} className="font-mtavruli font-medium text-base text-foreground hover:text-primary transition-colors">
              {t("nav.gallery")}
            </Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="font-mtavruli font-medium text-base text-foreground hover:text-primary transition-colors">
              {t("nav.contact")}
            </Link>

            <div className="flex gap-2 pt-2 border-t border-border">
              {(["ka", "en", "ru"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setIsOpen(false); }}
                  className={`px-3 py-1.5 rounded-full text-sm font-sans font-medium transition-colors ${
                    language === lang
                      ? "bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {languageNames[lang]}
                </button>
              ))}
            </div>
            <Link to="/contact" onClick={() => setIsOpen(false)}>
              <Button size="sm" className="rounded-full w-fit gap-1.5">
                {t("nav.leaveRequest")}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
