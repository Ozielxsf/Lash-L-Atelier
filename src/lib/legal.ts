import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Reads a generated legal document (content/legal/*.md — built by
 * scripts/build-legal.py from the Wallink templates) and parses the small
 * markdown subset those templates use into blocks.
 *
 * Deliberately tiny and dependency-free: headings, paragraphs, bullet lists
 * (with wrapped continuation lines), rules, and **bold** / *italic* inline.
 * Rendering is plain React elements — no raw HTML is ever injected.
 */

export type Inline = { text: string; bold?: boolean; italic?: boolean };
export type Block =
  | { type: "h2"; text: string; id: string }
  | { type: "p"; content: Inline[] }
  | { type: "ul"; items: Inline[][] }
  | { type: "hr" };

export type LegalDoc = { title: string; effective: string | null; blocks: Block[] };

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ text: src.slice(last, m.index) });
    out.push(m[1] !== undefined ? { text: m[1], bold: true } : { text: m[2], italic: true });
    last = re.lastIndex;
  }
  if (last < src.length) out.push({ text: src.slice(last) });
  return out;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export async function getLegalDoc(name: "privacy" | "terms" | "accessibility"): Promise<LegalDoc> {
  const raw = await readFile(path.join(process.cwd(), "content/legal", `${name}.md`), "utf8");
  const lines = raw.split("\n");

  let title = "";
  let effective: string | null = null;
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[][] | null = null;

  const flushPara = () => {
    if (para.length) blocks.push({ type: "p", content: parseInline(para.join(" ")) });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: "ul", items: list.map((item) => parseInline(item.join(" "))) });
    list = null;
  };

  for (const line of lines) {
    if (line.startsWith("# ")) {
      title = line.slice(2).trim();
      continue;
    }
    const eff = line.match(/^Effective date:\s*(.+)$/);
    if (eff) {
      effective = eff[1].trim();
      continue;
    }
    // The bold business-name line under the title is shown in the page header instead.
    if (!blocks.length && !para.length && /^\*\*[^*]+\*\*$/.test(line.trim())) continue;
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      const text = line.slice(3).trim();
      blocks.push({ type: "h2", text, id: slug(text) });
    } else if (line.trim() === "---") {
      flushPara();
      flushList();
      blocks.push({ type: "hr" });
    } else if (/^\s*- /.test(line)) {
      flushPara();
      list ??= [];
      list.push([line.replace(/^\s*- /, "").trim()]);
    } else if (list && /^\s{2,}\S/.test(line)) {
      list[list.length - 1].push(line.trim());
    } else if (!line.trim()) {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();

  // Drop a leading rule left behind by the header lines.
  while (blocks[0]?.type === "hr") blocks.shift();
  return { title, effective, blocks };
}
