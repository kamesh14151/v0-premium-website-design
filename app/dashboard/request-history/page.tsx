"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, Clock, TrendingUp, Copy, Eye, RefreshCw } from 'lucide-react';
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
      <section>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Request History</h1>
        <p className="text-muted-foreground">
          Monitor, analyze, and debug all API requests in real-time
        </p>
      </section>

      <Card className="bg-black/40 backdrop-blur border-white/10 hover:border-white/20 transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Latency trends and error rate</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-white/10" onClick={loadRequests}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis stroke="#666" dataKey="time" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="latency" stroke="#2563eb" strokeWidth={2} name="Latency (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Total Requests</p>
            <p className="text-3xl font-bold">{isLoading ? '...' : stats.totalRequests >= 1000 ? `${(stats.totalRequests / 1000).toFixed(1)}K` : stats.totalRequests}</p>
            <p className="text-xs text-green-400 mt-2">Last 100 requests</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Avg Response</p>
            <p className="text-3xl font-bold">{isLoading ? '...' : `${stats.avgResponse.toFixed(1)}s`}</p>
            <p className="text-xs text-muted-foreground mt-2">Response time</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Success Rate</p>
            <p className="text-3xl font-bold">{isLoading ? '...' : `${stats.successRate}%`}</p>
            <p className="text-xs text-green-400 mt-2">{stats.errors} errors</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Errors</p>
            <p className="text-3xl font-bold">{isLoading ? '...' : stats.errors}</p>
            <p className="text-xs text-amber-400 mt-2">Failed requests</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Total Cost</p>
            <p className="text-3xl font-bold">{isLoading ? '...' : `$${stats.totalCost.toFixed(2)}`}</p>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by model, endpoint, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 hover:border-white/20"
          />
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-foreground text-sm hover:border-white/20 transition"
        >
          <option value="all">All Statuses</option>
          <option value="200">Success (200)</option>
          <option value="429">Rate Limited (429)</option>
          <option value="500">Server Error (500)</option>
        </select>
        <Button variant="outline" className="border-white/10 hover:border-white/20 gap-2">
          <Filter className="w-4 h-4" />
          More Filters
        </Button>
        <Button variant="outline" className="border-white/10 hover:border-white/20 gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <Card className="bg-black/40 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>Latest 24 hours - Click to view details</CardDescription>
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
