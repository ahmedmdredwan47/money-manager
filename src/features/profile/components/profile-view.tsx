"use client";

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Key, Camera, CheckCircle2 } from "lucide-react";

export function ProfileView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Profile"
        description="Manage personal credentials, avatar, security, and membership status."
        action={
          <Button variant="gradient" size="sm">
            Update Profile
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="text-center p-6 space-y-4">
          <div className="relative inline-block mx-auto">
            <Avatar fallback="AM" className="h-24 w-24 border-4 border-emerald-500/20 text-xl font-bold" />
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold">Alex Morgan</h2>
            <p className="text-sm text-muted-foreground">alex.morgan@wealthwise.io</p>
          </div>
          <div className="flex justify-center gap-2">
            <Badge variant="success">Pro Plan</Badge>
            <Badge variant="outline">Verified</Badge>
          </div>
        </Card>

        {/* Profile Details Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input defaultValue="Alex Morgan" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input defaultValue="alex.morgan@wealthwise.io" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input defaultValue="+1 (555) 234-5678" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Occupation</label>
                <Input defaultValue="Senior Software Engineer" />
              </div>
            </div>
            <div className="pt-4 border-t border-border/40 flex justify-end">
              <Button variant="gradient" size="sm">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
