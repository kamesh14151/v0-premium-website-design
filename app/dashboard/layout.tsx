import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { DashboardHeader } from "@/components/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col min-h-svh">
      <DashboardHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10 bg-black/40 backdrop-blur py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AJStudioz AI Platform. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Developed with</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span className="text-muted-foreground">by</span>
              <span className="font-bold text-primary">AJ STUDIOZ</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
