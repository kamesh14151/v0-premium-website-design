"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
}

export function WebhooksList({
  webhooks,
  onWebhookDeleted,
}: {
  webhooks: Webhook[];
  onWebhookDeleted: () => void;
}) {
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteWebhook = async (webhookId: string) => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", webhookId);

      if (error) throw error;
      setWebhookToDelete(null);
      onWebhookDeleted();
    } catch (error) {
      console.error("Error deleting webhook:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="space-y-3">
        {webhooks.map((webhook) => (
          <div
            key={webhook.id}
            className="flex items-start justify-between p-4 border border-border rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-semibold">{webhook.name}</h4>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {webhook.url}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {webhook.events.map((event) => (
                  <span
                    key={event}
                    className="text-xs bg-muted px-2 py-1 rounded"
                  >
                    {event}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Created: {formatDate(webhook.created_at)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Test
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setWebhookToDelete(webhook.id)}
                disabled={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog
        open={!!webhookToDelete}
        onOpenChange={(open) => !open && setWebhookToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your webhook will stop receiving events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                webhookToDelete && handleDeleteWebhook(webhookToDelete)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
