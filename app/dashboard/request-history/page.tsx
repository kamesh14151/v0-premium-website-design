"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, Clock, TrendingUp, Copy, Eye, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockRequests = [
  { id: 1, model: "GPT-4", tokens: 1240, status: 200, time: "2.3s", cost: "$0.05", timestamp: "2 hours ago", endpoint: "/v1/chat/completions", method: "POST", latency: 2340 },
  { id: 2, model: "Claude-3", tokens: 856, status: 200, time: "1.8s", cost: "$0.03", timestamp: "3 hours ago", endpoint: "/v1/messages", method: "POST", latency: 1850 },
  { id: 3, model: "GPT-3.5", tokens: 512, status: 200, time: "0.9s", cost: "$0.01", timestamp: "5 hours ago", endpoint: "/v1/chat/completions", method: "POST", latency: 920 },
  { id: 4, model: "GPT-4", tokens: 2048, status: 429, time: "N/A", cost: "$0.00", timestamp: "6 hours ago", endpoint: "/v1/chat/completions", method: "POST", latency: 0 },
  { id: 5, model: "Claude-3", tokens: 1024, status: 200, time: "2.1s", cost: "$0.04", timestamp: "8 hours ago", endpoint: "/v1/messages", method: "POST", latency: 2120 },
];

const latencyData = [
  { time: '00:00', latency: 145, errors: 2 },
  { time: '04:00', latency: 132, errors: 1 },
  { time: '08:00', latency: 156, errors: 3 },
  { time: '12:00', latency: 148, errors: 2 },
  { time: '16:00', latency: 162, errors: 4 },
  { time: '20:00', latency: 151, errors: 2 },
  { time: '24:00', latency: 140, errors: 1 },
];

export default function RequestHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const filteredRequests = mockRequests.filter((req) => {
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
            <Button variant="outline" size="sm" className="border-white/10"><RefreshCw className="w-4 h-4" /></Button>
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
            <p className="text-3xl font-bold">12.5K</p>
            <p className="text-xs text-green-400 mt-2">↑ 23% this week</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Avg Response</p>
            <p className="text-3xl font-bold">1.8s</p>
            <p className="text-xs text-green-400 mt-2">↓ 12% faster</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Success Rate</p>
            <p className="text-3xl font-bold">99.8%</p>
            <p className="text-xs text-green-400 mt-2">2 errors</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Errors</p>
            <p className="text-3xl font-bold">2</p>
            <p className="text-xs text-amber-400 mt-2">1 rate limit</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Total Cost</p>
            <p className="text-3xl font-bold">$12.45</p>
            <p className="text-xs text-muted-foreground mt-2">This month</p>
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
                {filteredRequests.map((req) => (
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
