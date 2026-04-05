import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,hsl(130_55%_40%/0.12)_0%,transparent_70%)] animate-orb-float" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(130_55%_50%/0.08)_0%,transparent_70%)] animate-orb-float-reverse" />
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[15%] left-[10%] w-24 h-24 rounded-3xl bg-white/40 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_rgba(45,143,67,0.08)]"
          animate={{ rotate: 360, y: [0, -20, 0] }}
          transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, y: { duration: 4, repeat: Infinity } }}
        />
        <motion.div
          className="absolute top-[25%] right-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(130_55%_40%/0.25)] to-[hsl(130_55%_40%/0.08)] backdrop-blur-md border border-[hsl(130_55%_40%/0.2)]"
          animate={{ rotate: -360, x: [0, 30, 0] }}
          transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, x: { duration: 5, repeat: Infinity } }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[20%] w-20 h-20 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40"
          animate={{ rotate: 180, y: [0, 20, 0] }}
          transition={{ rotate: { duration: 18, repeat: Infinity, ease: "linear" }, y: { duration: 6, repeat: Infinity } }}
        />
        <motion.div
          className="absolute bottom-[30%] left-[18%] w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(130_55%_40%/0.3)] to-[hsl(130_55%_50%/0.15)] backdrop-blur-md"
          animate={{ rotate: 360, x: [0, -20, 0] }}
          transition={{ rotate: { duration: 12, repeat: Infinity, ease: "linear" }, x: { duration: 4, repeat: Infinity } }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Giant 404 with gradient */}
          <div className="relative inline-block mb-8">
            <h1 className="font-sans text-[120px] md:text-[180px] lg:text-[220px] font-light leading-none tracking-tighter bg-gradient-to-br from-[hsl(130_55%_40%)] via-[hsl(130_55%_50%)] to-[hsl(130_55%_35%)] bg-clip-text text-transparent select-none">
              404
            </h1>
          </div>

          <motion.p
            className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[hsl(130_55%_35%)] mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {t("notFound.title")}
          </motion.p>

          <motion.h2
            className="font-sans text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Lost in the <span className="font-medium">wilderness</span>
          </motion.h2>

          <motion.p
            className="font-sans text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {t("notFound.message")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <MagneticButton strength={0.25}>
              <Link
                to="/"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full
                  bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white
                  hover:from-[#359e4d] hover:to-[#44b862]
                  shadow-[0_8px_24px_rgba(45,143,67,0.35)] hover:shadow-[0_12px_32px_rgba(45,143,67,0.45)]
                  transition-all font-sans text-sm font-semibold"
              >
                <Home className="w-4 h-4" />
                {t("notFound.backHome")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
