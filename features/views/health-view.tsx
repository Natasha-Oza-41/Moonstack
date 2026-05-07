"use client";

import { Bike, Dumbbell, Moon, Save, Smile } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Card, PrimaryButton, Progress } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";

const today = new Date().toISOString().slice(0, 10);

export function HealthView() {
  const { healthLogs, addHealthLog } = useMoonstackStore();
  const current = healthLogs.find((log) => log.date === today) || healthLogs[0];
  const [date, setDate] = useState(current?.date || today);
  const [mood, setMood] = useState(current?.mood || "Focused");
  const [sleepHours, setSleepHours] = useState(current?.sleepHours || 7);
  const [waterGlasses, setWaterGlasses] = useState(current?.waterGlasses || 6);
  const [activities, setActivities] = useState(current?.activities || "");
  const [notes, setNotes] = useState(current?.notes || "");

  const recovery = Math.min(100, Math.round((sleepHours / 8) * 70 + Math.min(waterGlasses, 8) * 3.75));
  const load = useMemo(() => Math.min(100, 35 + activities.split(",").filter(Boolean).length * 12), [activities]);
  const consistency = Math.min(100, healthLogs.length * 12);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    addHealthLog({ date, mood, sleepHours, waterGlasses, activities, notes });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Card className="p-5">
        <Badge tone="mint">Energy System</Badge>
        <h2 className="mt-4 text-3xl font-semibold">Track the human behind the work.</h2>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-white/50">Date</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0b0d14] px-4 py-3 text-sm outline-none focus:border-emerald-300/35" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/50">Mood</span>
              <select value={mood} onChange={(event) => setMood(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0b0d14] px-4 py-3 text-sm outline-none focus:border-emerald-300/35">
                {["Focused", "Calm", "Tired", "Stressed", "Energized", "Distracted"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/50">Sleep hours</span>
              <input type="number" min={0} max={14} step={0.25} value={sleepHours} onChange={(event) => setSleepHours(Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-emerald-300/35" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-white/50">Water glasses</span>
              <input type="number" min={0} max={20} value={waterGlasses} onChange={(event) => setWaterGlasses(Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-emerald-300/35" />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm text-white/50">Activities</span>
            <input value={activities} onChange={(event) => setActivities(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-emerald-300/35" placeholder="Gym, walk, deep work, DSA, meditation" />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-white/50">Energy notes</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-[150px] w-full rounded-3xl border border-white/[0.06] bg-black/20 p-4 text-sm leading-6 text-white/70 outline-none focus:border-emerald-300/25" placeholder="What affected focus today?" />
          </label>
          <PrimaryButton type="submit" className="w-fit"><Save size={15} /> Save energy log</PrimaryButton>
        </form>
      </Card>

      <div className="space-y-5">
        <Card className="p-5">
          <h3 className="font-semibold">Today</h3>
          <div className="mt-5 grid gap-3">
            {[
              ["Mood", mood, Smile],
              ["Sleep", `${sleepHours}h`, Moon],
              ["Hydration", `${waterGlasses} glasses`, Dumbbell],
              ["Activities", activities || "No activities logged", Bike],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <Icon className="mb-3 text-white/40" size={18} />
                <div className="font-semibold">{String(value)}</div>
                <div className="mt-1 text-xs text-white/38">{String(label)}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold">Burnout Guard</h3>
          <p className="mt-2 text-sm text-white/42">Computed from your current health logs.</p>
          <div className="mt-6 space-y-5">
            <div><div className="mb-2 flex justify-between text-sm"><span>Recovery</span><span>{recovery}%</span></div><Progress value={recovery} /></div>
            <div><div className="mb-2 flex justify-between text-sm"><span>Load</span><span>{load}%</span></div><Progress value={load} color="var(--amber)" /></div>
            <div><div className="mb-2 flex justify-between text-sm"><span>Consistency</span><span>{consistency}%</span></div><Progress value={consistency} color="var(--blue)" /></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
