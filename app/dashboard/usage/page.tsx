"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, TrendingUp } from 'lucide-react';

interface UsageMetric {
  name: string;
  current: number;
  limit: number;
  unit: string;
  percentage: number;
  status: "ok" | "warning" | "critical";
}

export default function UsagePage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [quotaData, setQuotaData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const response = await fetch('/api/usage/quota');
        if (response.ok) {
          const data = await response.json();
          setQuotaData(data);
          console.log('[v0] Quota data loaded:', data);
        }
      } catch (error) {
        console.error('[v0] Failed to load quota:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuota();
  }, []);

  const usageMetrics: UsageMetric[] = quotaData ? [
    {
      name: "Tokens Used",
      current: quotaData.tokens_used || 0,
      limit: quotaData.tokens_limit || 100000,
      unit: "tokens",
      percentage: quotaData.token_percentage || 0,
      status: quotaData.token_percentage >= 90 ? "critical" : quotaData.token_percentage >= 75 ? "warning" : "ok",
    },
    {
      name: "Monthly Spend",
      current: 45.67,
      limit: 500,
      unit: "USD",
      percentage: 9.13,
      status: "ok",
    },
    {
      name: "Rate Limit",
      current: 850,
      limit: quotaData.requests_limit || 10,
      unit: "req/min",
      percentage: (850 / (quotaData.requests_limit || 10)) * 100,
      status: (850 / (quotaData.requests_limit || 10)) * 100 >= 85 ? "warning" : "ok",
    },
    {
      name: "Current Plan",
      current: 1,
      limit: 1,
      unit: quotaData.current_plan || "Free",
      percentage: 100,
      status: "ok",
    },
  ] : [];

  const dailyUsage = [
    { date: "Nov 15", requests: 1250, tokens: 250000, cost: 4.5 },
    { date: "Nov 14", requests: 980, tokens: 195000, cost: 3.2 },
    { date: "Nov 13", requests: 1520, tokens: 304000, cost: 5.8 },
    { date: "Nov 12", requests: 750, tokens: 150000, cost: 2.1 },
    { date: "Nov 11", requests: 890, tokens: 178000, cost: 3.5 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "bg-green-500/10 text-green-300 border-green-500/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
      case "critical":
        return "bg-red-500/10 text-red-300 border-red-500/20";
      default:
        return "bg-white/5";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Usage & Quotas</h1>
          <p className="text-gray-400">
            Monitor your API usage and quota limits
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 bg-black/40 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-black border-white/10">
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {quotaData?.token_percentage >= 80 && (
        <Card className="mb-8 bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="font-semibold text-yellow-300">Approaching quota limit</p>
              <p className="text-sm text-yellow-200">You've used {quotaData.token_percentage.toFixed(1)}% of your monthly tokens</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {usageMetrics.map((metric) => (
          <Card key={metric.name} className="bg-black/40 border-white/10">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-white">{metric.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(metric.status)}`}>
                    {metric.unit === "Free" || metric.unit === "Pro" ? metric.unit : `${metric.percentage.toFixed(1)}%`}
                  </span>
                </div>
                {metric.unit !== "Free" && metric.unit !== "Pro" && (
                  <>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(metric.percentage)} transition-all`}
                        style={{ width: `${Math.min(100, metric.percentage)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 flex justify-between">
                      <span>
                        {metric.current.toLocaleString()} {metric.unit}
                      </span>
                      <span>/ {metric.limit.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Daily Usage</CardTitle>
              <CardDescription>API calls, tokens, and costs by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-2 font-semibold text-gray-400 uppercase text-xs">Date</th>
                      <th className="text-right px-4 py-2 font-semibold text-gray-400 uppercase text-xs">
                        Requests
                      </th>
                      <th className="text-right px-4 py-2 font-semibold text-gray-400 uppercase text-xs">
                        Tokens
                      </th>
                      <th className="text-right px-4 py-2 font-semibold text-gray-400 uppercase text-xs">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyUsage.map((day) => (
                      <tr
                        key={day.date}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3 text-white">{day.date}</td>
                        <td className="text-right px-4 py-3 text-gray-300">
                          {day.requests.toLocaleString()}
                        </td>
                        <td className="text-right px-4 py-3 text-gray-300">
                          {(day.tokens / 1000).toLocaleString()}K
                        </td>
                        <td className="text-right px-4 py-3 text-cyan-400 font-mono">
                          ${day.cost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Quota Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2 text-gray-300">Monthly Limit</p>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    value="500"
                    className="w-full pl-6 pr-3 py-2 border border-white/10 rounded bg-white/5 text-white text-sm hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 text-gray-300">Rate Limit (req/min)</p>
                <input
                  type="number"
                  value="1000"
                  className="w-full px-3 py-2 border border-white/10 rounded bg-white/5 text-white text-sm hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Save Settings</Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Alerts</CardTitle>
              <CardDescription>Get notified when limits near</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-white/20" />
                <span className="text-sm text-gray-300">80% of quota</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-white/20" />
                <span className="text-sm text-gray-300">100% of quota</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-white/20" />
                <span className="text-sm text-gray-300">Rate limit exceeded</span>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
