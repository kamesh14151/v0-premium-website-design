"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, Users, LogOut } from 'lucide-react';

export function DashboardHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/api-keys", label: "API Keys", icon: "🔑" },
    { href: "/dashboard/request-history", label: "Requests", icon: "📋" },
    { href: "/dashboard/docs", label: "Docs", icon: "📚" },
    { href: "/dashboard/console", label: "Console", icon: "💻" },
    { href: "/dashboard/models", label: "Models", icon: "🤖" },
    { href: "/dashboard/usage", label: "Usage", icon: "📈" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "📉" },
  ];

  return (
    <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image 
              src="/nexariq-logo.png" 
              alt="Nexariq Logo" 
              width={32} 
              height={32}
              className="object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-accent bg-clip-text text-transparent">
              Nexariq
            </span>
          </Link>
          <nav className="hidden lg:flex gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-primary/20 text-accent border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2 border-white/10 hover:border-accent/30 hover:bg-accent/5">
                <Settings className="w-4 h-4" />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-black/90 border border-white/10 backdrop-blur-xl">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/team" className="cursor-pointer flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing" className="cursor-pointer">
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <form action="/api/auth/logout" method="post" className="w-full">
                  <button type="submit" className="w-full text-left flex items-center gap-2 text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon" className="lg:hidden border-white/10 hover:border-accent/30">
            ☰
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden border-t border-white/10 px-6 py-2 flex gap-1 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap text-xs px-3 py-1 rounded font-medium transition ${
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
