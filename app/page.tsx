import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-background/95">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between p-6 md:p-8 border-b border-border/40 backdrop-blur-sm">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nexariq
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 md:px-10 py-20">
          <div className="w-full max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-border/50 bg-card/40 backdrop-blur-sm">
              <span className="text-sm text-accent">✨ New</span>
              <span className="mx-3 text-border/50">|</span>
              <span className="text-sm text-muted-foreground">Advanced analytics and team collaboration</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Ship LLM products
              </span>
              <br />
              <span className="text-foreground">that actually work</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Build, test, and deploy AI applications with Nexariq. Get production-ready models, comprehensive analytics, and enterprise-grade reliability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Start Building Free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/docs">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Sub-100ms latency with global infrastructure"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "SOC 2 Type II compliance and 99.99% uptime SLA"
              },
              {
                icon: BarChart3,
                title: "Full Visibility",
                description: "Real-time analytics and detailed usage tracking"
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm hover:border-border transition-colors">
                <feature.icon className="w-6 h-6 text-accent mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
