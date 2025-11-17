"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

const AVAILABLE_EVENTS = [
  "model.completion",
  "usage.limit_reached",
  "api_key.created",
  "api_key.revoked",
];

export function CreateWebhookDialog({
  open,
  onOpenChange,
  onWebhookCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWebhookCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "model.completion",
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      if (!name || !url) {
        throw new Error("Name and URL are required");
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch {
        throw new Error("Invalid URL");
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: dbError } = await supabase.from("webhooks").insert([
        {
          user_id: user.id,
          name,
          url,
          events: selectedEvents,
          secret: Math.random().toString(36).substring(2, 15),
        },
      ]);

      if (dbError) throw dbError;

      setName("");
      setUrl("");
      setSelectedEvents(["model.completion"]);
      setTimeout(() => {
        onWebhookCreated();
        onOpenChange(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating webhook");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Webhook</DialogTitle>
          <DialogDescription>
            Set up a webhook to receive real-time event notifications
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateWebhook} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Webhook Name</Label>
            <Input
              id="name"
              placeholder="e.g., Analytics Service"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url">Endpoint URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://your-domain.com/webhooks"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Events to Subscribe</Label>
            <div className="space-y-2">
              {AVAILABLE_EVENTS.map((event) => (
                <label key={event} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvents([...selectedEvents, event]);
                      } else {
                        setSelectedEvents(
                          selectedEvents.filter((e) => e !== event)
                        );
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{event}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Webhook"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
