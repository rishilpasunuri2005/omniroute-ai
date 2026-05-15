"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GitBranch, Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";

export default function LoginPage() {
  return (
    <div className="grid-bg relative flex min-h-screen items-center justify-center px-4">
      {/* Background */}
      <div className="hero-gradient absolute inset-0" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <motion.div variants={staggerItem} className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 glow-border">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold">OmniRoute AI</span>
          </Link>
        </motion.div>

        {/* Form Card */}
        <motion.div variants={staggerItem} className="glass-card rounded-2xl p-8">
          <div className="text-center">
            <h1 className="text-xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your OmniRoute workspace
            </p>
          </div>

          {/* Social Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:bg-white/10">
              <Github className="h-4 w-4" />
              GitHub
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:bg-white/10">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-xs text-muted-foreground">or continue with email</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* Form */}
          <form className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs text-muted-foreground">Email</span>
              <Input
                type="email"
                placeholder="you@example.com"
                className="bg-white/[0.03] border-white/8"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs text-muted-foreground">Password</span>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-white/[0.03] border-white/8"
              />
            </label>
            <Button className="w-full gap-2" type="button">
              <Mail className="h-4 w-4" />
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
