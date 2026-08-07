"use client";

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Settings, Bell, Shield, Palette, Database, Save } from "lucide-react";

export function SettingsView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Settings"
        description="Preferences, security, notifications, and integration configuration."
        action={
          <Button variant="gradient" size="sm">
            <Save className="mr-2 h-4 w-4" /> Save Preferences
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General & Regional</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security & Supabase</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Regional Preferences</CardTitle>
              <CardDescription>Currency format, timezone, and language standards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Currency</label>
                  <Input defaultValue="USD ($)" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Zone</label>
                  <Input defaultValue="UTC-05:00 Eastern Time" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <Input defaultValue="MM/DD/YYYY" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Day of Week</label>
                  <Input defaultValue="Sunday" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-emerald-500" />
                Theme & Display
              </CardTitle>
              <CardDescription>Toggle light and dark color schemes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                <div>
                  <p className="font-semibold text-sm">Theme Mode</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-teal-500" />
                Alerts & Reminders
              </CardTitle>
              <CardDescription>Configure email and push notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Budget Limit Alerts", desc: "Notify when spending exceeds 80% of budget" },
                { title: "Weekly Financial Summary", desc: "Receive automated digest every Monday" },
                { title: "Bill Payment Reminders", desc: "Get notified 3 days before upcoming bills" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-emerald-500 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Supabase Connection Backbone
              </CardTitle>
              <CardDescription>Database synchronization and auth status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-500">
                  <Database className="h-4 w-4" />
                  <span>SUPABASE_URL: Configured via .env.local</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  PostgreSQL schema types generated & client modules ready for authentication.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
