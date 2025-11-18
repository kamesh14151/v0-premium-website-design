"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
}

export function ApiKeysList({
  keys,
  onKeyDeleted,
}: {
  keys: ApiKey[];
  onKeyDeleted: () => void;
}) {
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteKey = async (keyId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/keys?id=${keyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete API key');
      }

      setKeyToDelete(null);
      onKeyDeleted();
    } catch (error) {
      console.error("Error deleting key:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      <div className="space-y-3">
        {keys.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-white/20 transition-all"
          >
            <div>
              <h4 className="font-semibold">{key.name}</h4>
              <div className="text-xs text-muted-foreground space-y-1 mt-2">
                <p>Created: {formatDateTime(key.created_at)}</p>
                {key.last_used_at ? (
                  <p>Last used: {formatDateTime(key.last_used_at)}</p>
                ) : (
                  <p>Last used: Never</p>
                )}
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setKeyToDelete(key.id)}
              disabled={isDeleting}
            >
              Revoke
            </Button>
          </div>
        ))}
      </div>

      <AlertDialog open={!!keyToDelete} onOpenChange={(open) => !open && setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Any applications using this key will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => keyToDelete && handleDeleteKey(keyToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Revoking..." : "Revoke"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
