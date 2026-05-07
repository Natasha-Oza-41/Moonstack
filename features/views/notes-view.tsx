"use client";

import { Braces, FileText, GitFork, Network, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, PrimaryButton } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";

export function NotesView() {
  const { notes, addNote, updateNote } = useMoonstackStore();
  const [activeNoteId, setActiveNoteId] = useState(notes[0]?.id || "");
  const [query, setQuery] = useState("");
  const activeNote = notes.find((note) => note.id === activeNoteId) || notes[0];

  useEffect(() => {
    if (!activeNoteId && notes[0]) setActiveNoteId(notes[0].id);
  }, [activeNoteId, notes]);

  const folders = useMemo(() => Array.from(new Set(notes.map((note) => note.folder))), [notes]);
  const visibleNotes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notes.filter((note) => !needle || `${note.title} ${note.folder} ${note.tags.join(" ")}`.toLowerCase().includes(needle));
  }, [notes, query]);

  function createNote(folder?: string) {
    const id = addNote(folder);
    setActiveNoteId(id);
  }

  function insertSnippet(snippet: string) {
    if (!activeNote) return;
    updateNote(activeNote.id, { content: `${activeNote.content}\n\n${snippet}` });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
      <Card className="p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <Badge tone="rose">Second Brain</Badge>
            <h2 className="mt-3 text-xl font-semibold">Notes Vault</h2>
          </div>
          <PrimaryButton onClick={() => createNote(activeNote?.folder)}><Plus size={15} /> New</PrimaryButton>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <Search size={15} className="text-white/35" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-white/28" placeholder="Search notes..." />
        </div>

        <div className="max-h-[640px] space-y-4 overflow-y-auto pr-1">
          {folders.map((folder) => {
            const folderNotes = visibleNotes.filter((note) => note.folder === folder);
            if (!folderNotes.length) return null;
            return (
              <div key={folder} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-medium"><FileText size={16} /> {folder}</div>
                  <button onClick={() => createNote(folder)} className="rounded-lg p-1 text-white/35 hover:bg-white/[0.06] hover:text-white"><Plus size={14} /></button>
                </div>
                <div className="space-y-2">
                  {folderNotes.map((note) => (
                    <button key={note.id} onClick={() => setActiveNoteId(note.id)} className={activeNote?.id === note.id ? "w-full rounded-xl bg-rose-300/10 px-3 py-2 text-left text-sm text-rose-100" : "w-full rounded-xl bg-black/18 px-3 py-2 text-left text-sm text-white/58 hover:bg-white/[0.05]"}>
                      {note.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {activeNote && (
        <Card className="p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-[260px] flex-1 space-y-3">
              <input value={activeNote.title} onChange={(event) => updateNote(activeNote.id, { title: event.target.value })} className="w-full bg-transparent text-2xl font-semibold outline-none focus:text-rose-100" />
              <div className="grid gap-2 md:grid-cols-2">
                <input value={activeNote.folder} onChange={(event) => updateNote(activeNote.id, { folder: event.target.value })} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none" placeholder="Folder" />
                <input value={activeNote.tags.join(", ")} onChange={(event) => updateNote(activeNote.id, { tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none" placeholder="tags" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => insertSnippet("```ts\n// code here\n```")}><Braces size={15} /> Code</Button>
              <Button onClick={() => insertSnippet("```mermaid\ngraph TD\nA[Idea] --> B[Action]\n```")}><Network size={15} /> Diagram</Button>
              <Button onClick={() => insertSnippet("[[Backlink]]")}><GitFork size={15} /> Backlink</Button>
            </div>
          </div>
          <textarea value={activeNote.content} onChange={(event) => updateNote(activeNote.id, { content: event.target.value })} className="min-h-[560px] w-full resize-y rounded-3xl border border-white/[0.06] bg-black/20 p-6 font-mono text-sm leading-7 text-white/70 outline-none focus:border-rose-300/25" />
        </Card>
      )}
    </div>
  );
}
