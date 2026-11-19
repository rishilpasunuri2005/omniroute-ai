import type { Attachment } from "@/types/api";

// Keep in sync with MAX_ATTACHMENT_CHARS in backend/app/schemas/chat.py.
export const MAX_ATTACHMENT_CHARS = 12_000;
// Refuse obviously huge files before reading them into memory.
const MAX_ATTACHMENT_BYTES = 64 * 1024;

// Knowledge-base documents are larger. Keep in sync with MAX_DOC_CHARS in backend/app/schemas/knowledge.py.
export const MAX_KNOWLEDGE_CHARS = 100_000;
export const MAX_KNOWLEDGE_BYTES = 400 * 1024;

export type MarkdownLimits = { maxChars: number; maxBytes: number };
const ATTACHMENT_LIMITS: MarkdownLimits = { maxChars: MAX_ATTACHMENT_CHARS, maxBytes: MAX_ATTACHMENT_BYTES };

export const ATTACHMENT_ACCEPT = ".md,text/markdown";

export type AttachmentResult = { ok: true; attachment: Attachment } | { ok: false; error: string };

/** Validate and read a user-selected file. Only `.md` files are accepted. */
export async function readMarkdownFile(file: File, limits: MarkdownLimits = ATTACHMENT_LIMITS): Promise<AttachmentResult> {
  const name = file.name.trim();
  if (!/\.md$/i.test(name) || name.length <= 3) {
    return { ok: false, error: "Only .md (Markdown) files can be attached." };
  }
  if (file.size === 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (file.size > limits.maxBytes) {
    return { ok: false, error: `That file is too large. Use a Markdown file under ${Math.round(limits.maxBytes / 1024)} KB.` };
  }

  let content: string;
  try {
    // fatal: true rejects files that are not valid UTF-8 text.
    content = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
  } catch {
    return { ok: false, error: "That file isn't valid UTF-8 text." };
  }
  if (content.includes("\u0000")) {
    return { ok: false, error: "That file isn't valid text." };
  }
  if (!content.trim()) {
    return { ok: false, error: "That file is empty." };
  }
  if (content.length > limits.maxChars) {
    return {
      ok: false,
      error: `That file is too long (${content.length.toLocaleString()} characters). The limit is ${limits.maxChars.toLocaleString()}.`,
    };
  }
  return { ok: true, attachment: { filename: name, content } };
}
