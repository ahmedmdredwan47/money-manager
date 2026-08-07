"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function ProfileView() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setEmail(user.email || "");
          setFullName(user.user_metadata?.full_name || user.email?.split("@")[0] || "User");
          setAvatarUrl(user.user_metadata?.avatar_url || "");

          const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            if (profile.full_name) setFullName(profile.full_name);
            if (profile.currency) setCurrency(profile.currency);
            if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be logged in.");

      const { error } = await (supabase as any).from("profiles").upsert(
        {
          id: user.id,
          full_name: fullName,
          currency,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) throw new Error(error.message);

      setMessage({ text: "Profile settings saved successfully!" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update profile.", isError: true });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-500" />
        Loading profile details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Profile"
        description="Manage personal credentials, avatar, preferred currency, and security."
      />

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium border ${
            message.isError
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20"
              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          }`}
        >
          {message.isError ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="text-center p-6 space-y-4">
          <div className="relative inline-block mx-auto">
            <Avatar
              src={avatarUrl}
              fallback={getInitials(fullName)}
              className="h-24 w-24 border-4 border-emerald-500/20 text-xl font-bold"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{fullName}</h2>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="flex justify-center gap-2">
            <Badge variant="success">Authenticated</Badge>
            <Badge variant="outline">Supabase Auth</Badge>
          </div>
        </Card>

        {/* Profile Details Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input value={email} disabled className="bg-muted/50 opacity-80 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Currency</label>
                <Input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="e.g. BDT, USD, EUR"
                  maxLength={5}
                  className="uppercase font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Avatar URL (Optional)</label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex justify-end">
              <Button
                variant="gradient"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="font-semibold"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
