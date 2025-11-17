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
    </div>
  );
}
