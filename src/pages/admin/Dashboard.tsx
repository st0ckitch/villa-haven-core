import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Home, FileText, Image, Mail } from "lucide-react";

interface Stats {
  totalVillas: number;
  availableVillas: number;
  reservedVillas: number;
  soldVillas: number;
  blogPosts: number;
  publishedPosts: number;
  renders: number;
  submissions: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const [villasRes, postsRes, rendersRes, subsRes] = await Promise.all([
        supabase.from("villas").select("status"),
        supabase.from("blog_posts").select("is_published"),
        supabase.from("renders").select("id", { count: "exact", head: true }),
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
      ]);

      const villas = villasRes.data || [];
      const posts = postsRes.data || [];

      setStats({
        totalVillas: villas.length,
        availableVillas: villas.filter((v) => v.status === "available").length,
        reservedVillas: villas.filter((v) => v.status === "reserved").length,
        soldVillas: villas.filter((v) => v.status === "sold").length,
        blogPosts: posts.length,
        publishedPosts: posts.filter((p) => p.is_published).length,
        renders: rendersRes.count || 0,
        submissions: subsRes.count || 0,
      });
    };

    fetchStats();
  }, []);

  const cards = stats
    ? [
        { label: "Total Villas", value: stats.totalVillas, icon: Home, detail: `${stats.availableVillas} available · ${stats.reservedVillas} reserved · ${stats.soldVillas} sold` },
        { label: "Blog Posts", value: stats.blogPosts, icon: FileText, detail: `${stats.publishedPosts} published` },
        { label: "Renders", value: stats.renders, icon: Image, detail: "Gallery images" },
        { label: "Submissions", value: stats.submissions, icon: Mail, detail: "Contact form" },
      ]
    : [];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-serif mb-6">Dashboard</h1>

      {!stats ? (
        <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          Loading...
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-sans">{card.label}</span>
                <card.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-serif">{card.value}</p>
              <p className="text-xs text-muted-foreground font-sans mt-1">{card.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
