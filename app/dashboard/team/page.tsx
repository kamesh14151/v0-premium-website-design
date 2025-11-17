"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, X, Shield, User, Mail, CheckCircle2, Clock } from 'lucide-react';

const mockTeamMembers = [
  { id: 1, email: "owner@example.com", full_name: "You", role: "owner", created_at: "2024-01-01T00:00:00Z", status: "active" },
  { id: 2, email: "admin@example.com", full_name: "John Admin", role: "admin", created_at: "2024-02-01T00:00:00Z", status: "active" },
  { id: 3, email: "member@example.com", full_name: "Jane Member", role: "member", created_at: "2024-03-01T00:00:00Z", status: "active" },
];

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState("member");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, get team_id from user's team
    const fetchMembers = async () => {
      try {
        // Placeholder - would get real team_id from auth/context
        const response = await fetch('/api/team/members?team_id=default-team');
        if (response.ok) {
          const data = await response.json();
          setMembers(data);
        }
      } catch (error) {
        console.error('[v0] Failed to load team members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail || !teamId) return;

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: selectedRole,
          team_id: teamId,
        }),
      });

      if (response.ok) {
        console.log('[v0] Invitation sent successfully');
        setInviteEmail("");
        setSelectedRole("member");
        setShowInviteForm(false);
      }
    } catch (error) {
      console.error('[v0] Failed to send invite:', error);
    }
  };

  const handleRemove = async (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <section>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Team Management</h1>
        <p className="text-muted-foreground text-lg">
          Collaborate seamlessly with granular access control and audit logs
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Team Members</p>
            <p className="text-3xl font-bold">{members.length}</p>
            <p className="text-xs text-green-400 mt-2">+1 this month</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Active Users</p>
            <p className="text-3xl font-bold">{members.filter(m => m.status === 'active').length}</p>
            <p className="text-xs text-muted-foreground mt-2">All online</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Pending Invites</p>
            <p className="text-3xl font-bold">{members.filter(m => m.status === 'pending').length}</p>
            <p className="text-xs text-amber-400 mt-2">Awaiting response</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase">Team Plan</p>
            <p className="text-lg font-bold">Professional</p>
            <p className="text-xs text-accent mt-2">Up to 10 members</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-black/40 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage member roles and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.length === 0 ? (
              <p className="text-gray-400 text-sm">No team members yet. Invite someone to get started.</p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:border-white/20 transition hover:bg-white/5">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-green-500/20 border-green-500/30">
                      <User className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{member.full_name || member.email}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-semibold capitalize">{member.role}</p>
                      <p className="text-xs text-muted-foreground">{new Date(member.created_at).toLocaleDateString()}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => setShowInviteForm(true)}
              className="w-full bg-primary hover:bg-primary/90 gap-2"
            >
              <Plus className="w-4 h-4" />
              Invite Member
            </Button>
            <Button variant="outline" className="w-full border-white/10 hover:border-white/20">
              View Audit Log
            </Button>
            <Button variant="outline" className="w-full border-white/10 hover:border-white/20">
              Team Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Permissions Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold uppercase text-xs">Permission</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-semibold uppercase text-xs">Owner</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-semibold uppercase text-xs">Admin</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-semibold uppercase text-xs">Member</th>
                </tr>
              </thead>
              <tbody>
                {["View API Keys", "Create API Keys", "Delete API Keys", "View Usage", "Manage Team", "Manage Billing", "View Logs", "Edit Settings"].map((perm) => (
                  <tr key={perm} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-4 px-4 font-medium">{perm}</td>
                    <td className="py-4 px-4 text-center"><CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-4 px-4 text-center">{perm !== "Manage Billing" && perm !== "Edit Settings" ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" /> : "–"}</td>
                    <td className="py-4 px-4 text-center">{perm === "View API Keys" || perm === "View Usage" || perm === "View Logs" ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" /> : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showInviteForm && (
        <Card className="bg-black/40 backdrop-blur border-white/10 border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invite Team Member</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowInviteForm(false)}>✕</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Email Address</label>
              <Input
                placeholder="teammate@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-black/40 border-white/10 hover:border-white/20"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Role</label>
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-foreground text-sm hover:border-white/20 transition"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleInvite} className="flex-1 bg-primary hover:bg-primary/90">
                Send Invite
              </Button>
              <Button variant="outline" onClick={() => setShowInviteForm(false)} className="flex-1 border-white/10 hover:border-white/20">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
