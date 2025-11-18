"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PremiumCard, StatCard } from "@/components/ui/premium-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, Clock, TrendingUp, Copy, Eye, RefreshCw, Activity, Zap, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RequestHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    avgResponse: 0,
    successRate: 0,
    errors: 0,
    totalCost: 0,
  });
  const [latencyData, setLatencyData] = useState<any[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load requests');
      }

      const formattedRequests = (data.requests || []).map((req: any) => ({
        id: req.id,
        model: req.model || 'Unknown',
        tokens: req.total_tokens || 0,
        status: req.status_code || 200,
        time: req.response_time ? `${(req.response_time / 1000).toFixed(2)}s` : 'N/A',
        cost: `$${(req.cost || 0).toFixed(4)}`,
        timestamp: getTimeAgo(new Date(req.created_at)),
        endpoint: '/api/chat/completions',
        method: 'POST',
        latency: req.response_time || 0,
      }));

      setRequests(formattedRequests);
      setStats(data.stats);
      setLatencyData(data.latencyData);

    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         req.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status.toString() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      {/* Premium Header */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-primary/20">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Request History
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Real-time monitoring and analytics for all API requests
            </p>
          </div>
        </div>
      </section>

      {/* Premium Performance Chart */}
      <PremiumCard gradient>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Performance Metrics
                </CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground/80">
                Real-time latency trends and response time analytics
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary/20 hover:border-primary/40 gap-2 hover:scale-105 transition-all duration-200" 
              onClick={loadRequests}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={latencyData}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis stroke="hsl(var(--muted-foreground))" dataKey="time" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="latency" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                name="Latency (ms)"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </PremiumCard>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard
          title="Total Requests"
          value={isLoading ? '...' : stats.totalRequests >= 1000 ? `${(stats.totalRequests / 1000).toFixed(1)}K` : stats.totalRequests}
          description="Last 100 requests"
          icon={<Activity className="w-6 h-6" />}
          trend="All time high"
          trendUp={true}
        />
        <StatCard
          title="Avg Response"
          value={isLoading ? '...' : `${stats.avgResponse.toFixed(1)}s`}
          description="Response time"
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          title="Success Rate"
          value={isLoading ? '...' : `${stats.successRate}%`}
          description={`${stats.errors} errors`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          trend="98% uptime"
          trendUp={true}
        />
        <StatCard
          title="Errors"
          value={isLoading ? '...' : stats.errors}
          description="Failed requests"
          icon={<AlertCircle className="w-6 h-6" />}
          trend="Low error rate"
          trendUp={false}
        />
        <StatCard
          title="Total Cost"
          value={isLoading ? '...' : `$${stats.totalCost.toFixed(2)}`}
          description="All time usage"
          icon={<DollarSign className="w-6 h-6" />}
        />
      </div>

      {/* Premium Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by model, endpoint, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-card/50 border-border hover:border-primary/30 focus:border-primary/50 rounded-xl text-base transition-all duration-200"
          />
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-5 h-12 rounded-xl bg-card/50 border border-border hover:border-primary/30 text-foreground font-medium transition-all duration-200 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="200">Success (200)</option>
          <option value="429">Rate Limited (429)</option>
          <option value="500">Server Error (500)</option>
        </select>
        <Button 
          variant="outline" 
          size="lg"
          className="border-border hover:border-primary/30 gap-2 hover:scale-105 transition-all duration-200"
        >
          <Filter className="w-4 h-4" />
          More Filters
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="border-border hover:border-primary/30 gap-2 hover:scale-105 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Premium Requests Table */}
      <PremiumCard gradient>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Recent Requests
              </CardTitle>
              <CardDescription className="text-base mt-1 text-muted-foreground/80">
                Latest 24 hours - Click any request to view detailed information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium uppercase text-xs">Model</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium uppercase text-xs">Endpoint</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium uppercase text-xs">Tokens</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium uppercase text-xs">Latency</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium uppercase text-xs">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium uppercase text-xs">Cost</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium uppercase text-xs">Time</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium uppercase text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      Loading requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No requests found. Start making API calls to see them here.
                    </td>
                  </tr>
                ) : filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer">
                    <td className="py-4 px-4 font-medium">{req.model}</td>
                    <td className="py-4 px-4 text-muted-foreground font-mono text-xs">{req.endpoint}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-accent" />
                        {req.tokens.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {req.time}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        req.status === 200
                          ? "bg-green-500/10 border-green-500/30 text-green-300"
                          : "bg-red-500/10 border-red-500/30 text-red-300"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold">{req.cost}</td>
                    <td className="py-4 px-4 text-muted-foreground text-xs">{req.timestamp}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(req)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedRequest && (
        <Card className="bg-black/40 backdrop-blur border-white/10 border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-primary">Request Details</CardTitle>
              <CardDescription>{selectedRequest.model} • {selectedRequest.endpoint}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)}>✕</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="font-bold">{selectedRequest.status}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Response Time</p>
                <p className="font-bold">{selectedRequest.time}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tokens Used</p>
                <p className="font-bold">{selectedRequest.tokens.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cost</p>
                <p className="font-bold text-accent">{selectedRequest.cost}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
