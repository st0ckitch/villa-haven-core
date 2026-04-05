import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Home as HomeIcon, FileText, Image, LogOut, Map, SlidersHorizontal, Settings, Info, BookOpen, Trophy, Fence } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Villas", to: "/admin/villas", icon: HomeIcon },
  { label: "Blog", to: "/admin/blog", icon: FileText },
  { label: "Gallery Images", to: "/admin/renders", icon: Image },
  { label: "Hero Slider", to: "/admin/sliders", icon: SlidersHorizontal },
  { label: "Plot Map", to: "/admin/plot-map", icon: Map },
  { label: "About Page", to: "/admin/about", icon: Info },
  { label: "Polograph Page", to: "/admin/polograph", icon: BookOpen },
  { label: "Olimpo Page", to: "/admin/olimpo", icon: Trophy },
  { label: "Equestrian Page", to: "/admin/equestrian", icon: Fence },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export const AdminLayout = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 border-r border-border bg-card flex flex-col">
        <div className="p-5 border-b border-border">
          <Link to="/" className="font-serif text-lg">
            Igavi<span className="text-primary">.</span>
          </Link>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.to === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground font-sans"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
