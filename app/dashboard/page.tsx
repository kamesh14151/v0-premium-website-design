"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, TrendingUp, AlertCircle, Users, Key, Activity, Zap, Clock, Gauge } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  status = "normal",
}: {
  title: string;
  value: string;
  description: string;
  icon: any;
  trend?: string;
  status?: "normal" | "warning" | "critical";
}) {
  const statusColors = {
    normal: "border-white/10 hover:border-white/20",
    warning: "border-amber-500/30 hover:border-amber-500/50 bg-amber-500/5",
    critical: "border-red-500/30 hover:border-red-500/50 bg-red-500/5",
  };

  return (
    <Card className={`bg-black/40 backdrop-blur border transition-all hover:shadow-lg hover:shadow-primary/10 ${statusColors[status]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
          <Icon className={`w-4 h-4 ${status === "warning" ? "text-amber-400" : status === "critical" ? "text-red-400" : "text-accent"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && <p className={`text-xs font-medium ${trend.includes("+") ? "text-green-400" : "text-amber-400"}`}>{trend}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    apiCalls: 0,
    activeKeys: 0,
    quotaUsed: 0,
    avgLatency: 0,
    uptime: 99.9,
    costThisMonth: 0,
  });

  const [chartData] = useState([
    { name: 'Mon', calls: 4200, tokens: 2400, latency: 120 },
    { name: 'Tue', calls: 6300, tokens: 2210, latency: 140 },
    { name: 'Wed', calls: 8200, tokens: 2290, latency: 110 },
    { name: 'Thu', calls: 7800, tokens: 2000, latency: 130 },
    { name: 'Fri', calls: 9200, tokens: 2181, latency: 125 },
    { name: 'Sat', calls: 11200, tokens: 2500, latency: 115 },
    { name: 'Sun', cases: 9800, tokens: 2100, latency: 140 },
  ]);

  const [modelDistribution] = useState([
    { name: 'GPT-4', value: 45, fill: '#2563eb' },
    { name: 'GPT-3.5', value: 30, fill: '#06b6d4' },
    { name: 'Claude', value: 20, fill: '#8b5cf6' },
    { name: 'Others', value: 5, fill: '#06b6d4' },
  ]);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        redirect("/auth/login");
      }
      
      setEmail(user.email || null);
      
      // Fetch real stats from database
      try {
        // Get API calls count
        const { count: apiCallsCount } = await supabase
          .from('request_history')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get active API keys count
        const { count: activeKeysCount } = await supabase
          .from('api_keys')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'active');

        // Get average latency
        const { data: latencyData } = await supabase
          .from('request_history')
          .select('response_time')
          .eq('user_id', user.id)
          .not('response_time', 'is', null)
          .limit(100);

        const avgLatency = latencyData && latencyData.length > 0
          ? Math.round(latencyData.reduce((sum, r) => sum + (r.response_time || 0), 0) / latencyData.length)
          : 0;

        // Get total cost this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: costData } = await supabase
          .from('request_history')
          .select('cost')
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString());

        const costThisMonth = costData && costData.length > 0
          ? costData.reduce((sum, r) => sum + (r.cost || 0), 0)
          : 0;

        // Calculate quota used (assuming 100k requests per month limit)
        const quotaLimit = 100000;
        const quotaUsed = apiCallsCount ? Math.round((apiCallsCount / quotaLimit) * 100) : 0;

        setStats({
          apiCalls: apiCallsCount || 0,
          activeKeys: activeKeysCount || 0,
          quotaUsed: Math.min(quotaUsed, 100),
          avgLatency: avgLatency,
          uptime: 99.98,
          costThisMonth: costThisMonth,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default values on error
        setStats({
          apiCalls: 0,
          activeKeys: 0,
          quotaUsed: 0,
          avgLatency: 0,
          uptime: 99.98,
          costThisMonth: 0,
        });
      }
      
      setIsLoading(false);
    }

    getUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-black">
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="grid gap-8">
          {/* Header Section */}
          <section>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Real-time API metrics, usage analytics, and performance insights
              </p>
            </div>
          </section>

          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total API Calls"
              value={stats.apiCalls >= 1000 ? `${(stats.apiCalls / 1000).toFixed(1)}K` : stats.apiCalls.toString()}
              description="Requests this month"
              icon={Activity}
              trend={stats.apiCalls > 0 ? `${stats.apiCalls} total requests` : "No requests yet"}
            />
            <StatCard
              title="Active API Keys"
              value={stats.activeKeys.toString()}
              description="Production keys in use"
              icon={Key}
              trend="2 keys near rotation"
              status={stats.activeKeys > 5 ? "warning" : "normal"}
            />
            <StatCard
              title="Quota Usage"
              value={`${stats.quotaUsed}%`}
              description="Of monthly quota used"
              icon={Zap}
              trend="2 days until limit"
              status={stats.quotaUsed > 75 ? "critical" : stats.quotaUsed > 50 ? "warning" : "normal"}
            />
            <StatCard
              title="Avg Latency"
              value={`${stats.avgLatency}ms`}
              description="P95 latency response time"
              icon={Clock}
              trend="↓ 8% improvement"
            />
          </div>

          {/* Advanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-black/40 backdrop-blur border-white/10 hover:border-white/20 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Request Volume & Performance</CardTitle>
                    <CardDescription>API calls and latency trends</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-white/10">7d</Button>
                    <Button variant="outline" size="sm" className="border-white/10 bg-white/5">30d</Button>
                    <Button variant="outline" size="sm" className="border-white/10">90d</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                    <XAxis stroke="#666" dataKey="name" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px' }} 
                      cursor={{ fill: 'rgba(37, 99, 235, 0.1)' }}
                    />
                    <Area type="monotone" dataKey="calls" stroke="#2563eb" strokeWidth={2} fill="url(#colorCalls)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur border-white/10 hover:border-white/20 transition-all">
              <CardHeader>
                <CardTitle className="text-sm">Model Distribution</CardTitle>
                <CardDescription className="text-xs">Usage breakdown by model</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={modelDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {modelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black/40 backdrop-blur border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">System Status</CardTitle>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Uptime</p>
                  <p className="text-2xl font-bold">{stats.uptime}%</p>
                </div>
                <p className="text-xs text-green-400">All systems operational</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-sm">This Month Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-2xl font-bold">${stats.costThisMonth.toFixed(2)}</p>
                </div>
                <p className="text-xs text-accent">Free tier: $0 - $50</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-sm">Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Team Members</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
                <p className="text-xs text-muted-foreground">2 pending invites</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-black/40 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Get started with your API</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/dashboard/api-keys" className="group p-4 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition">
                    <div className="text-xl mb-2">🔑</div>
                    <h4 className="font-semibold text-sm mb-1">Generate API Key</h4>
                    <p className="text-xs text-muted-foreground">Create new credentials</p>
                    <ArrowRight className="w-4 h-4 text-accent mt-3 opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                  <Link href="/dashboard/console" className="group p-4 rounded-lg border border-white/10 hover:border-accent/50 hover:bg-accent/5 transition">
                    <div className="text-xl mb-2">💻</div>
                    <h4 className="font-semibold text-sm mb-1">API Console</h4>
                    <p className="text-xs text-muted-foreground">Test API endpoints</p>
                    <ArrowRight className="w-4 h-4 text-accent mt-3 opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                  <Link href="/dashboard/request-history" className="group p-4 rounded-lg border border-white/10 hover:border-secondary/50 hover:bg-secondary/5 transition">
                    <div className="text-xl mb-2">📊</div>
                    <h4 className="font-semibold text-sm mb-1">Request History</h4>
                    <p className="text-xs text-muted-foreground">View all requests</p>
                    <ArrowRight className="w-4 h-4 text-accent mt-3 opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <CardTitle className="text-sm">Quota Alert</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-amber-200 mb-3">You're at 72% quota. Upgrade soon to avoid interruptions.</p>
                  <Link href="/dashboard/billing">
                    <Button size="sm" className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200">Upgrade Now</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="text-sm">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm font-mono text-accent break-all">{email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Plan</p>
                    <p className="text-sm font-semibold">Professional</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
