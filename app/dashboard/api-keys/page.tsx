"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PremiumCard, StatCard } from "@/components/ui/premium-card";
import { createClient } from "@/lib/supabase/client";
import { CreateKeyDialog } from "@/components/create-key-dialog";
import { ApiKeysList } from "@/components/api-keys-list";
import { Lock, Shield, Key, RotateCw, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load API keys');
      }

      setKeys(data.keys || []);
    } catch (error) {
      console.error("Error loading API keys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyCreated = () => {
    loadApiKeys();
    setShowCreateDialog(false);
  };

  const handleKeyDeleted = () => {
    loadApiKeys();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Premium Header */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border border-primary/20">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              API Keys
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Secure authentication credentials with enterprise-grade encryption
            </p>
          </div>
        </div>
      </section>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Keys"
          value={isLoading ? '...' : keys.filter(k => k.is_active).length}
          description={`${keys.filter(k => k.is_active).length} operational keys`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          trend="All systems secure"
          trendUp={true}
        />
        <StatCard
          title="Total Keys"
          value={isLoading ? '...' : keys.length}
          description={`${keys.filter(k => !k.is_active).length} inactive keys`}
          icon={<Shield className="w-6 h-6" />}
        />
        <StatCard
          title="Last Created"
          value={isLoading ? '...' : keys.length > 0 ? new Date(keys[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
          description="Most recent API key"
          icon={<Clock className="w-6 h-6" />}
        />
      </div>

      <div className="grid gap-8">
        {/* Premium API Keys Card */}
        <PremiumCard gradient>
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Your API Keys
                </CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground/80">
                Enterprise-grade security with SHA-256 encryption and scoped permissions
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/25"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create New Key
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <RotateCw className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading your API keys...</p>
              </div>
            ) : keys.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 mb-6">
                  <Lock className="w-16 h-16 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">No API Keys Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first API key to start making authenticated requests to our platform
                </p>
                <Button 
                  onClick={() => setShowCreateDialog(true)} 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Your First Key
                </Button>
              </div>
            ) : (
              <ApiKeysList keys={keys} onKeyDeleted={handleKeyDeleted} />
            )}
          </CardContent>
        </PremiumCard>

        {/* Premium Security Best Practices */}
        <PremiumCard gradient>
          <CardHeader>
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
                <Lock className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Security Best Practices
                </CardTitle>
                <CardDescription className="text-base mt-1 text-muted-foreground/80">
                  Enterprise-grade security guidelines for your API keys
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 border border-border hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-400" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h4 className="font-semibold text-lg">Key Rotation</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Rotate keys every 90 days to minimize exposure risk and maintain security compliance
                    </p>
                    <Button variant="outline" size="sm" className="w-full border-primary/20 hover:border-primary/40 gap-2 hover:scale-105 transition-all duration-200">
                      <RotateCw className="w-3.5 h-3.5" />
                      Rotate Keys
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 border border-border hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h4 className="font-semibold text-lg">Scoped Permissions</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Create keys with specific permissions for each application using granular access controls
                    </p>
                    <Button variant="outline" size="sm" className="w-full border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-200">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 border border-border hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h4 className="font-semibold text-lg">Environment Variables</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Never commit API keys to version control. Use secure environment variables instead
                    </p>
                    <Button variant="outline" size="sm" className="w-full border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-200">
                      View Example
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 border border-border hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-400" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h4 className="font-semibold text-lg">Access Logs</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Monitor key usage and unauthorized access attempts with real-time alerting
                    </p>
                    <Button variant="outline" size="sm" className="w-full border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-200">
                      View Logs
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </PremiumCard>
      </div>

      <CreateKeyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onKeyCreated={handleKeyCreated}
      />
    </div>
  );
}
