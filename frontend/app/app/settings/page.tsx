"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Coins,
  Key,
  Moon,
  Palette,
  Settings2,
  SlidersHorizontal,
  Sun,
  User,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace, API keys, and preferences
        </p>
      </motion.div>

      {/* Profile */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs text-muted-foreground">Display Name</span>
              <Input placeholder="Your name" defaultValue="" className="bg-white/[0.03] border-white/8" />
            </label>
            <label className="space-y-2">
              <span className="text-xs text-muted-foreground">Email</span>
              <Input placeholder="you@example.com" defaultValue="" className="bg-white/[0.03] border-white/8" />
            </label>
          </CardContent>
        </Card>
      </motion.div>

      {/* API Keys */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Key className="h-4 w-4 text-primary" />
              API Keys
            </CardTitle>
            <CardDescription>Configure your provider API keys for model access</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Groq API Key", placeholder: "gsk_..." },
              { label: "OpenRouter API Key", placeholder: "sk-or-..." },
              { label: "OpenAI API Key", placeholder: "sk-..." },
              { label: "Anthropic API Key", placeholder: "sk-ant-..." },
            ].map((key) => (
              <label key={key.label} className="space-y-2">
                <span className="text-xs text-muted-foreground">{key.label}</span>
                <Input
                  type="password"
                  placeholder={key.placeholder}
                  className="bg-white/[0.03] border-white/8 font-mono text-xs"
                />
              </label>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Token Budget */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-primary" />
              Token Budget
            </CardTitle>
            <CardDescription>Daily token limits to control costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-bold text-primary">100K</p>
                <p className="mt-1 text-xs text-muted-foreground">Daily Budget</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="mt-1 text-xs text-muted-foreground">Used Today</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">100K</p>
                <p className="mt-1 text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Routing Config */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Routing Configuration
            </CardTitle>
            <CardDescription>Runtime configuration (set via environment variables)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              ["API URL", "http://localhost:8000"],
              ["Confidence Threshold", "0.62"],
              ["Max Retries", "2"],
              ["AI Timeout", "90s"],
            ].map(([label, value]) => (
              <label key={label} className="space-y-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Input readOnly value={value} className="bg-white/[0.03] border-white/8 text-xs" />
              </label>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4 text-primary" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive alerts for routing failures</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative h-6 w-11 rounded-full transition-colors ${notifications ? "bg-primary" : "bg-white/10"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notifications ? "left-[22px]" : "left-0.5"}`}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={staggerItem} className="flex justify-end">
        <Button className="gap-2">
          <Settings2 className="h-4 w-4" />
          Save Changes
        </Button>
      </motion.div>
    </motion.div>
  );
}
