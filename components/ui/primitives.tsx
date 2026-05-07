"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("glass rounded-[1.35rem]", className)}
    >
      {children}
    </motion.section>
  );
}

export function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: "mint" | "blue" | "violet" | "amber" | "rose" | "muted" }) {
  const tones = {
    mint: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    blue: "border-blue-400/20 bg-blue-400/10 text-blue-200",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-200",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    muted: "border-white/10 bg-white/[0.04] text-white/58",
  };

  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,.06)]", tones[tone])}>{children}</span>;
}

export function Progress({ value, color = "var(--mint)" }: { value: number; color?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
      />
    </div>
  );
}

export function Button({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/75 transition hover:border-white/18 hover:bg-white/[0.07] hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/30",
        "active:scale-[0.985]",
        "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-white/10 disabled:hover:bg-white/[0.04] disabled:hover:text-white/75",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...props}
      className={cn("border-cyan-200/20 bg-gradient-to-r from-cyan-200 via-emerald-200 to-lime-200 text-slate-950 shadow-[0_12px_38px_rgba(103,232,249,.16)] hover:text-slate-950", props.className)}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-white/[0.055]", className)}>
      <motion.div
        className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["0%", "300%"] }}
        transition={{ duration: 1.35, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function ViewSkeleton() {
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-5 h-10 max-w-xl" />
        <Skeleton className="mt-3 h-4 max-w-2xl" />
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-white/12 bg-white/[0.025] p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl border border-cyan-200/16 bg-cyan-200/8 shadow-[0_0_40px_rgba(103,232,249,.12)]" />
      <h3 className="mt-5 font-semibold text-white/86">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
