import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [resetSent, setResetSent] = useState(false);
  const { signIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (user && isAdmin) {
    navigate("/admin", { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/admin", { replace: true });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
      toast({ title: "Reset link sent", description: "Check your email for a password reset link." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-serif mb-2">
            {mode === "login" ? "Admin Login" : "Reset Password"}
          </h1>
          <p className="text-sm text-muted-foreground font-sans">
            {mode === "login"
              ? "Sign in to access the admin panel"
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 font-sans">
                {error}
              </div>
            )}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block font-sans">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required className="rounded-lg font-sans" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block font-sans">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="rounded-lg font-sans" />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-xl h-11 font-sans font-medium">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <button
              type="button"
              onClick={() => { setMode("forgot"); setError(""); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground font-sans transition-colors"
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 font-sans">
                {error}
              </div>
            )}
            {resetSent ? (
              <div className="bg-primary/10 text-primary text-sm rounded-lg p-3 font-sans text-center">
                Check your email for a password reset link.
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block font-sans">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required className="rounded-lg font-sans" />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-xl h-11 font-sans font-medium">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </>
            )}
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); setResetSent(false); }}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-sans transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
