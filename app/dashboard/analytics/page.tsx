"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PremiumCard, StatCard } from "@/components/ui/premium-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

// Mock data for charts
const requestsData = [
  { date: "Nov 9", requests: 400, errors: 24 },
  { date: "Nov 10", requests: 300, errors: 21 },
  { date: "Nov 11", requests: 200, errors: 22 },
  { date: "Nov 12", requests: 278, errors: 20 },
  { date: "Nov 13", requests: 189, errors: 18 },
  { date: "Nov 14", requests: 239, errors: 25 },
  { date: "Nov 15", requests: 349, errors: 12 },
];

const tokensData = [
  { date: "Nov 9", input: 45000, output: 32000 },
  { date: "Nov 10", input: 38000, output: 28000 },
  { date: "Nov 11", input: 32000, output: 24000 },
  { date: "Nov 12", input: 52000, output: 36000 },
  { date: "Nov 13", input: 42000, output: 30000 },
  { date: "Nov 14", input: 48000, output: 35000 },
  { date: "Nov 15", input: 58000, output: 42000 },
];

const modelUsageData = [
  { name: "Nexariq Pro", value: 45, fill: "#3b82f6" },
  { name: "Nexariq Fast", value: 35, fill: "#10b981" },
  { name: "Nexariq Vision", value: 20, fill: "#f59e0b" },
];

const costBreakdownData = [
  { name: "Requests", value: 25, fill: "#8b5cf6" },
  { name: "Storage", value: 15, fill: "#ec4899" },
  { name: "Premium", value: 10, fill: "#06b6d4" },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestsData, setRequestsData] = useState<any[]>([]);
  const [tokensData, setTokensData] = useState<any[]>([]);
  const [modelUsageData, setModelUsageData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch requests data
        const { data: requests, error: reqError } = await supabase
          .from('request_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(100);

        if (reqError) throw reqError;

        // Process data for charts
        const last7Days = [...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const requestsByDate = last7Days.map(date => {
          const dayRequests = (requests || []).filter((r: any) => r.created_at.startsWith(date));
          return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            requests: dayRequests.length,
            errors: dayRequests.filter((r: any) => r.status_code !== 200).length,
          };
        });

        const tokensByDate = last7Days.map(date => {
          const dayRequests = (requests || []).filter((r: any) => r.created_at.startsWith(date));
          const totalInput = dayRequests.reduce((sum: number, r: any) => sum + (r.prompt_tokens || 0), 0);
          const totalOutput = dayRequests.reduce((sum: number, r: any) => sum + (r.completion_tokens || 0), 0);
          return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            input: totalInput,
            output: totalOutput,
          };
        });

        // Model usage distribution
        const modelCounts: any = {};
        (requests || []).forEach((r: any) => {
          const model = r.model || 'Unknown';
          modelCounts[model] = (modelCounts[model] || 0) + 1;
        });

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        const modelData = Object.entries(modelCounts).map(([name, value], idx) => ({
          name,
          value: value as number,
          fill: colors[idx % colors.length],
        }));

        setRequestsData(requestsByDate);
        setTokensData(tokensByDate);
        setModelUsageData(modelData);

        // Calculate summary stats
        const totalRequests = requests?.length || 0;
        const totalTokens = (requests || []).reduce((sum: number, r: any) => sum + (r.total_tokens || 0), 0);
        const successfulRequests = (requests || []).filter((r: any) => r.status_code === 200).length;
        const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0;
        const totalCost = (requests || []).reduce((sum: number, r: any) => sum + (r.cost || 0), 0);

        setAnalyticsData({
          total_requests: totalRequests,
          total_tokens: totalTokens,
          success_rate: successRate,
          total_cost: totalCost,
        });
      } catch (error) {
        console.error('[v0] Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const stats = [
    { label: "Total Requests", value: analyticsData?.total_requests?.toString() || "0", change: "+12%", icon: "📊" },
    { label: "Total Tokens", value: `${(analyticsData?.total_tokens / 1000000).toFixed(1)}M` || "0", change: "+8%", icon: "🔤" },
    { label: "Success Rate", value: `${analyticsData?.success_rate}%` || "0%", change: "+0.3%", icon: "✓" },
    { label: "Total Cost", value: `$${analyticsData?.total_cost?.toFixed(2)}` || "$0", change: "+5%", icon: "💰" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-primary/20">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Real-time insights and performance metrics
              </p>
            </div>
          </div>
        </section>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-44 h-12 bg-card/50 border-border hover:border-primary/30 rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-xl border-border">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="lg" className="border-border hover:border-primary/30 gap-2 hover:scale-105 transition-all duration-200">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={analyticsData?.total_requests?.toString() || "0"}
          description="vs last period"
          icon={<Activity className="w-6 h-6" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Total Tokens"
          value={`${(analyticsData?.total_tokens / 1000000).toFixed(1)}M` || "0"}
          description="vs last period"
          icon={<TrendingUp className="w-6 h-6" />}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Success Rate"
          value={`${analyticsData?.success_rate}%` || "0%"}
          description="vs last period"
          icon={<BarChart3 className="w-6 h-6" />}
          trend="+0.3%"
          trendUp={true}
        />
        <StatCard
          title="Total Cost"
          value={`$${analyticsData?.total_cost?.toFixed(2)}` || "$0"}
          description="vs last period"
          icon={<PieChartIcon className="w-6 h-6" />}
          trend="+5%"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PremiumCard gradient>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">API Requests & Errors</CardTitle>
                <CardDescription className="text-base mt-1">Request volume and error rate trends</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={requestsData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="requests" stroke="#2563eb" fill="url(#colorRequests)" name="Requests" strokeWidth={2} />
                <Line type="monotone" dataKey="errors" stroke="#dc2626" strokeWidth={2} name="Errors" dot={{ fill: '#dc2626', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </PremiumCard>

        <PremiumCard gradient>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Token Usage Trends</CardTitle>
                <CardDescription className="text-base mt-1">Input and output token consumption</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tokensData}>
                <defs>
                  <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="input" stroke="#2563eb" fill="url(#colorInput)" name="Input Tokens" strokeWidth={2} />
                <Area type="monotone" dataKey="output" stroke="#10b981" fill="url(#colorOutput)" name="Output Tokens" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </PremiumCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PremiumCard gradient>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Usage by Model</CardTitle>
                <CardDescription className="text-base mt-1">Percentage of requests by model type</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={modelUsageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {modelUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </PremiumCard>

        <PremiumCard gradient>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Cost Breakdown</CardTitle>
                <CardDescription className="text-base mt-1">Monthly spending distribution</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </PremiumCard>
      </div>
    </div>
  );
}
