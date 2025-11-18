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
import { createClient } from "@/lib/supabase/client";
import { CreateKeyDialog } from "@/components/create-key-dialog";
import { ApiKeysList } from "@/components/api-keys-list";
import { Lock, Eye, EyeOff, Copy, Trash2, RotateCw } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <section>
        <h1 className="text-4xl font-bold tracking-tight mb-2">API Keys</h1>
        <p className="text-muted-foreground text-lg">
          Generate, manage, and rotate your API keys with granular scope control
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Active Keys</p>
            <p className="text-3xl font-bold">{isLoading ? '...' : keys.filter(k => k.is_active).length}</p>
            <p className="text-xs text-green-400 mt-2">{keys.filter(k => k.is_active).length} operational</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Total Keys</p>
            <p className="text-3xl font-bold">{isLoading ? '...' : keys.length}</p>
            <p className="text-xs text-muted-foreground mt-2">{keys.filter(k => !k.is_active).length} inactive</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Last Created</p>
            <p className="text-lg font-bold">{isLoading ? '...' : keys.length > 0 ? new Date(keys[0].created_at).toLocaleDateString() : 'None'}</p>
            <p className="text-xs text-muted-foreground mt-2">Most recent key</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>
                Create and manage API keys with scoped permissions
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90">
              + Create New Key
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading API keys...
              </div>
            ) : keys.length === 0 ? (
              <div className="text-center py-12">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t created any API keys yet
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90">
                  Create Your First Key
                </Button>
              </div>
            ) : (
              <ApiKeysList keys={keys} onKeyDeleted={handleKeyDeleted} />
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-semibold text-sm mb-2">Key Rotation</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Rotate keys every 90 days to minimize exposure risk
                </p>
                <Button variant="outline" size="sm" className="w-full border-white/10 text-xs gap-2">
                  <RotateCw className="w-3 h-3" />
                  Rotate Keys
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-semibold text-sm mb-2">Scoped Permissions</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Create keys with specific permissions for each application
                </p>
                <Button variant="outline" size="sm" className="w-full border-white/10 text-xs">
                  Learn More
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-semibold text-sm mb-2">Environment Variables</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Never commit API keys to version control
                </p>
                <Button variant="outline" size="sm" className="w-full border-white/10 text-xs">
                  View Example
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-semibold text-sm mb-2">Access Logs</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Monitor key usage and unauthorized access attempts
                </p>
                <Button variant="outline" size="sm" className="w-full border-white/10 text-xs">
                  View Logs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateKeyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onKeyCreated={handleKeyCreated}
      />
    </div>
  );
}
