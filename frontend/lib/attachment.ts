import type { Attachment } from "@/types/api";

// Keep in sync with MAX_ATTACHMENT_CHARS in backend/app/schemas/chat.py.
export const MAX_ATTACHMENT_CHARS = 12_000;
// Refuse obviously huge files before reading them into memory.
const MAX_ATTACHMENT_BYTES = 64 * 1024;

export const ATTACHMENT_ACCEPT = ".md,text/markdown";

export type AttachmentResult = { ok: true; attachment: Attachment } | { ok: false; error: string };

/** Validate and read a user-selected file. Only `.md` files are accepted. */
export async function readMarkdownFile(file: File): Promise<AttachmentResult> {
  const name = file.name.trim();
  if (!/\.md$/i.test(name) || name.length <= 3) {
    return { ok: false, error: "Only .md (Markdown) files can be attached." };
  }
  if (file.size === 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { ok: false, error: "That file is too large. Attach a Markdown file under 64 KB." };
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
  if (content.length > MAX_ATTACHMENT_CHARS) {
    return {
      ok: false,
      error: `That file is too long (${content.length.toLocaleString()} characters). The limit is ${MAX_ATTACHMENT_CHARS.toLocaleString()}.`,
    };
  }
  return { ok: true, attachment: { filename: name, content } };
}
