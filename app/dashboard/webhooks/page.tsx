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
import { CreateWebhookDialog } from "@/components/create-webhook-dialog";
import { WebhooksList } from "@/components/webhooks-list";

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("webhooks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setWebhooks(data || []);
      }
    } catch (error) {
      console.error("Error loading webhooks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebhookCreated = () => {
    loadWebhooks();
    setShowCreateDialog(false);
  };

  const handleWebhookDeleted = () => {
    loadWebhooks();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Webhooks</h1>
        <p className="text-muted-foreground">
          Set up webhooks to receive real-time event notifications
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Webhooks</CardTitle>
              <CardDescription>
                Configure webhooks to receive event notifications
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Webhook
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading webhooks...
              </div>
            ) : webhooks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t created any webhooks yet
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  Create Your First Webhook
                </Button>
              </div>
            ) : (
              <WebhooksList webhooks={webhooks} onWebhookDeleted={handleWebhookDeleted} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Events</CardTitle>
            <CardDescription>
              Subscribe to these events to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border border-border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">
                  model.completion
                </h4>
                <p className="text-xs text-muted-foreground">
                  Triggered when an API call completes
                </p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">
                  usage.limit_reached
                </h4>
                <p className="text-xs text-muted-foreground">
                  Triggered when your quota limit is reached
                </p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">
                  api_key.created
                </h4>
                <p className="text-xs text-muted-foreground">
                  Triggered when a new API key is created
                </p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">
                  api_key.revoked
                </h4>
                <p className="text-xs text-muted-foreground">
                  Triggered when an API key is revoked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateWebhookDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onWebhookCreated={handleWebhookCreated}
      />
    </div>
  );
}
