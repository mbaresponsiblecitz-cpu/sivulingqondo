import { marked } from 'marked';

marked.setOptions({ breaks: true });

/** Render markdown as block HTML (supports multiple paragraphs, lists, links). */
export function md(text: string | undefined | null): string {
  if (!text) return '';
  return marked.parse(text, { async: false }) as string;
}

/** Render markdown inline (no wrapping <p>) — for use inside an existing paragraph. */
export function mdInline(text: string | undefined | null): string {
  if (!text) return '';
  return marked.parseInline(text, { async: false }) as string;
}
