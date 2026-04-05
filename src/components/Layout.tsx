import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingContactButton } from "@/components/FloatingContactButton";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col max-w-[1440px] mx-auto bg-background shadow-xl relative">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContactButton />
    </div>
  );
};
