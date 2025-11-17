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
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import crypto from "crypto";

export function CreateKeyDialog({
  open,
  onOpenChange,
  onKeyCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyCreated: () => void;
}) {
  const [keyName, setKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Generate a random API key
      const randomKey = crypto.randomBytes(32).toString("hex");
      const keyHash = crypto
        .createHash("sha256")
        .update(randomKey)
        .digest("hex");

      const { error: dbError } = await supabase.from("api_keys").insert([
        {
          user_id: user.id,
          name: keyName,
          key_hash: keyHash,
        },
      ]);

      if (dbError) throw dbError;

      setCreatedKey(randomKey);
      setKeyName("");
      setTimeout(() => {
        onKeyCreated();
        setCreatedKey(null);
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating key");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key for your application
          </DialogDescription>
        </DialogHeader>

        {createdKey ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                Key Created Successfully!
              </p>
              <div className="bg-background rounded p-3 font-mono text-xs break-all">
                {createdKey}
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                Make sure to save this key. You won&apos;t be able to see it again.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateKey} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g., Production Server"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                required
              />
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
                {isCreating ? "Creating..." : "Create Key"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
