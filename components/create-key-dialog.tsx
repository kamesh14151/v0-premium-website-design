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

  // Reset state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset all state when closing
      setCreatedKey(null);
      setKeyName("");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      // Call API route to create key in Neon
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: keyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create API key');
      }

      setCreatedKey(data.key);
      // Don't call onKeyCreated here, wait until user closes dialog
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating key");
      console.error('Key creation error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              <div className="bg-background rounded p-3 font-mono text-xs break-all select-all">
                {createdKey}
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                ⚠️ Make sure to save this key. You won&apos;t be able to see it again.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(createdKey);
                  alert('API Key copied to clipboard!');
                }}
                variant="outline"
              >
                Copy Key
              </Button>
              <Button
                onClick={() => {
                  handleOpenChange(false);
                  onKeyCreated(); // Refresh the list when done
                }}
              >
                Done
              </Button>
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
                onClick={() => handleOpenChange(false)}
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
