"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ATTACHMENT_ACCEPT, MAX_KNOWLEDGE_BYTES, MAX_KNOWLEDGE_CHARS, readMarkdownFile } from "@/lib/attachment";
import { deleteKnowledge, fetchKnowledge, uploadKnowledge } from "@/services/api";
import type { KnowledgeDocument } from "@/types/api";
import { compactNumber } from "@/lib/utils";

function friendlyError(caught: unknown, fallback: string) {
  const message = caught instanceof Error ? caught.message : "";
  try {
    const parsed = JSON.parse(message) as { detail?: unknown };
    if (typeof parsed.detail === "string") return parsed.detail;
  } catch {
    // not JSON; fall through
  }
  return message || fallback;
}

export default function KnowledgePage() {
  const auth = useAuth();
  const getToken = auth?.getToken || (async () => null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    try {
      setDocs(await fetchKnowledge(await getToken()));
    } catch (caught) {
      setErrors([friendlyError(caught, "Unable to load your knowledge library")]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const failures: string[] = [];
    for (const file of Array.from(files)) {
      setBusy(file.name);
      const result = await readMarkdownFile(file, { maxChars: MAX_KNOWLEDGE_CHARS, maxBytes: MAX_KNOWLEDGE_BYTES });
      if (!result.ok) {
        failures.push(`${file.name}: ${result.error}`);
        continue;
      }
      try {
        await uploadKnowledge(await getToken(), result.attachment);
      } catch (caught) {
        failures.push(`${file.name}: ${friendlyError(caught, "Upload failed")}`);
      }
    }
    setBusy(null);
    setErrors(failures);
    if (inputRef.current) inputRef.current.value = "";
    await load();
  }

  async function onDelete(doc: KnowledgeDocument) {
    setBusy(doc.filename);
    try {
      await deleteKnowledge(await getToken(), doc.id);
      setDocs((current) => current.filter((item) => item.id !== doc.id));
      setErrors([]);
    } catch (caught) {
      setErrors([friendlyError(caught, "Delete failed")]);
    } finally {
      setBusy(null);
    }
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Markdown files the assistant searches to answer your chat questions
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ATTACHMENT_ACCEPT}
            className="hidden"
            data-testid="knowledge-file-input"
            onChange={(event) => void onFiles(event.target.files)}
          />
          <Button onClick={() => inputRef.current?.click()} disabled={busy !== null} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {busy ? `Indexing ${busy}` : "Upload .md files"}
          </Button>
        </div>
      </motion.div>

      {errors.length > 0 && (
        <motion.div
          variants={staggerItem}
          role="alert"
          className="space-y-1 rounded-none border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Your library
            </CardTitle>
            <CardDescription>
              Only .md files (up to {compactNumber(MAX_KNOWLEDGE_CHARS)} characters each, 10 files). Uploading a file with the
              same name replaces it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No documents yet. Upload a Markdown file and ask about it in Chat. Relevant passages are found
                automatically.
              </p>
            ) : (
              <ul className="divide-y divide-border border border-border">
                {docs.map((doc) => (
                  <li key={doc.id} className="flex flex-wrap items-center gap-4 p-4">
                    <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {compactNumber(doc.char_count)} chars · {doc.chunk_count} chunks ·{" "}
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void onDelete(doc)}
                      disabled={busy !== null}
                      aria-label={`Delete ${doc.filename}`}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
