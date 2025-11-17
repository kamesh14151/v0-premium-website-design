"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Zap, TrendingUp, AlertCircle, Activity, Database } from 'lucide-react';

const userGrowthData = [
  { date: "Nov 1", users: 120 },
  { date: "Nov 5", users: 145 },
  { date: "Nov 10", users: 178 },
  { date: "Nov 15", users: 210 },
  { date: "Nov 17", users: 245 },
];

const requestVolumeData = [
  { model: "Nexariq Pro", requests: 4200 },
  { model: "Nexariq Fast", requests: 3100 },
  { model: "Nexariq Vision", requests: 1800 },
];

export default function AdminDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/system');
        if (response.ok) {
          const data = await response.json();
          setSystemMetrics(data);
          console.log('[v0] Admin metrics loaded:', data);
        }
      } catch (error) {
        console.error('[v0] Failed to load admin metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">System metrics, user management, and platform analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-gray-400 mb-1 uppercase">Total Users</p>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-white">{systemMetrics?.total_users || "0"}</p>
            <p className="text-xs text-green-400 mt-2">↑ 12% this month</p>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-gray-400 mb-1 uppercase">API Requests</p>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{(systemMetrics?.total_requests / 1000).toFixed(1)}K</p>
            <p className="text-xs text-green-400 mt-2">↑ 8% this week</p>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-gray-400 mb-1 uppercase">Tokens Processed</p>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{(systemMetrics?.total_tokens / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-green-400 mt-2">↑ 15% this week</p>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-gray-400 mb-1 uppercase">Error Rate</p>
              {(systemMetrics?.error_rate || 0) > 1 ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Activity className="w-4 h-4 text-green-400" />
              )}
            </div>
            <p className="text-3xl font-bold text-white">{systemMetrics?.error_rate?.toFixed(2) || "0.00"}%</p>
            <p className="text-xs text-gray-400 mt-2">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white">User Growth</CardTitle>
            <CardDescription>Monthly user acquisition</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }} />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Request Volume by Model</CardTitle>
            <CardDescription>API usage distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={requestVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="model" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }} />
                <Bar dataKey="requests" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-gray-300">API Server</span>
              <span className="text-xs px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-300">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-gray-300">Database</span>
              <span className="text-xs px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-300">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-gray-300">Cache Layer</span>
              <span className="text-xs px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-300">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-gray-300">Queue Service</span>
              <span className="text-xs px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300">Optimal</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700 justify-start">
              View User Logs
            </Button>
            <Button className="w-full bg-white/5 hover:bg-white/10 justify-start">
              Manage API Keys
            </Button>
            <Button className="w-full bg-white/5 hover:bg-white/10 justify-start">
              Review Billing
            </Button>
            <Button className="w-full bg-white/5 hover:bg-white/10 justify-start">
              System Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Models */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Top Models by Usage</CardTitle>
          <CardDescription>Models with highest request volume this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemMetrics?.top_models?.map((model: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{model.model}</p>
                  <p className="text-xs text-gray-400">{model.usage_count?.toLocaleString()} requests</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-cyan-400">{(model.total_tokens / 1000000).toFixed(2)}M tokens</p>
                  <div className="w-24 h-2 bg-white/10 rounded-full mt-1">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full" 
                      style={{ width: `${(model.usage_count / (systemMetrics?.total_requests || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
