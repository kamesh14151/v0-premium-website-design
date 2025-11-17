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
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for testing",
    tokens_per_month: "100K",
    requests_per_minute: 10,
    features: [
      "100K tokens/month",
      "10 requests/minute",
      "Basic analytics",
      "Community support",
      "1 API key",
    ],
    limitations: [
      "Limited to Nexariq Fast model",
      "No custom models",
      "No webhooks",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    description: "For serious developers",
    tokens_per_month: "10M",
    requests_per_minute: 1000,
    features: [
      "10M tokens/month",
      "1,000 requests/minute",
      "Advanced analytics",
      "Priority support",
      "5 API keys",
      "All models",
      "Webhooks",
      "Request history",
    ],
    limitations: [],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For scale",
    tokens_per_month: "Unlimited",
    requests_per_minute: "Unlimited",
    features: [
      "Unlimited tokens",
      "Unlimited requests",
      "Custom analytics",
      "Dedicated support",
      "Unlimited API keys",
      "All models + custom",
      "Advanced webhooks",
      "SSO/SAML",
      "SLA guarantee",
    ],
    limitations: [],
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [usageData, setUsageData] = useState<any>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/analytics/summary');
        if (response.ok) {
          const data = await response.json();
          setUsageData(data);
        }
      } catch (error) {
        console.error('[v0] Failed to load usage data:', error);
      }
    };

    fetchUsage();
  }, []);

  const handleUpgrade = (planName: string) => {
    console.log('[v0] Upgrading to plan:', planName);
    alert(`Upgrade to ${planName} plan - This would redirect to Stripe checkout`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
        <p className="text-gray-400">Manage your subscription and view usage</p>
      </div>

      {/* Current Usage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-gray-400 mb-1 uppercase">Current Plan</p>
            <p className="text-3xl font-bold text-cyan-400">{currentPlan}</p>
          </CardContent>
        </Card>
        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-gray-400 mb-1 uppercase">Tokens Used</p>
            <p className="text-3xl font-bold">{usageData?.total_tokens?.toLocaleString() || "0"}</p>
          </CardContent>
        </Card>
        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-gray-400 mb-1 uppercase">API Calls</p>
            <p className="text-3xl font-bold">{usageData?.api_calls?.toLocaleString() || "0"}</p>
          </CardContent>
        </Card>
        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-gray-400 mb-1 uppercase">This Month</p>
            <p className="text-3xl font-bold text-green-400">${usageData?.total_cost?.toFixed(2) || "0.00"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`bg-black border transition-all ${
                plan.popular
                  ? "border-cyan-500/50 ring-1 ring-cyan-500/50"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-600">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold text-white">
                    {plan.price}
                    {plan.price !== "Custom" && <span className="text-lg text-gray-400">/mo</span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{plan.tokens_per_month} tokens/month</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-white text-sm">Features</h4>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.limitations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white text-sm">Limitations</h4>
                    {plan.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <X className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-400">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => handleUpgrade(plan.name)}
                  className={`w-full gap-2 ${
                    plan.popular
                      ? "bg-cyan-600 hover:bg-cyan-700"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {currentPlan === plan.name ? "Current Plan" : "Upgrade"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage History */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Usage Summary</CardTitle>
          <CardDescription>Current month activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Token Usage</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Input Tokens</span>
                  <span className="text-white font-mono">{(usageData?.total_tokens * 0.6).toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Output Tokens</span>
                  <span className="text-white font-mono">{(usageData?.total_tokens * 0.4).toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Cost Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">API Usage</span>
                  <span className="text-white font-mono">${(usageData?.total_cost * 0.7).toFixed(2)}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Premium Features</span>
                  <span className="text-white font-mono">${(usageData?.total_cost * 0.3).toFixed(2)}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
