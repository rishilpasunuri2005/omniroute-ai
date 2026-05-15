"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with intelligent routing",
    features: [
      "100 routing requests/day",
      "3 connected models",
      "Basic analytics",
      "Community support",
      "Standard latency",
    ],
    cta: "Start Free",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For teams building production AI apps",
    features: [
      "10,000 routing requests/day",
      "Unlimited models",
      "Advanced analytics & metrics",
      "Priority support",
      "Custom routing rules",
      "Webhook integrations",
      "Team collaboration",
    ],
    cta: "Start Pro Trial",
    href: "/sign-up",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations at scale",
    features: [
      "Unlimited routing requests",
      "Dedicated infrastructure",
      "SSO & RBAC",
      "SLA guarantee",
      "Custom model integrations",
      "Audit logging",
      "Dedicated account manager",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
    href: "#",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Start free and scale as your AI workflows grow.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-6 lg:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={staggerItem}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "pricing-popular"
                  : "glass-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mt-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <Link
                href={plan.href}
                className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-medium transition-all ${
                  plan.popular
                    ? "bg-primary text-primary-foreground shadow-glow hover:shadow-glow-lg"
                    : "border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
