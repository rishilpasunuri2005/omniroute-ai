"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <div className="absolute inset-0 border border-primary/10 rounded-2xl" />

          {/* Content */}
          <div className="relative px-8 py-16 text-center sm:px-16 lg:py-24">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Build Smarter <span className="gradient-text">AI Workflows</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Join developers who route millions of AI tasks through intelligent pipelines.
              Start building today — it&apos;s free.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/app/chat"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:bg-primary/90 hover:shadow-glow-lg"
              >
                Start Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#"
                className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-all hover:border-white/20 hover:bg-white/8"
              >
                <BookOpen className="h-4 w-4 text-primary" />
                View Documentation
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
