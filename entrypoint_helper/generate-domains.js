import fs from "fs";
import path from "path";
import { URL } from "url";

const wikiPagePath = path.resolve(
  "entrypoints/Sites_using_MediaWiki.wiki_page_source",
);
const domainsPath = path.resolve("entrypoints/sites-domains.ts");

if (!fs.existsSync(wikiPagePath)) {
  console.error(`Input file not found: ${wikiPagePath}`);
  process.exit(1);
}

const wikiContent = fs.readFileSync(wikiPagePath, "utf-8");

const domainRegex =
  /;[^-\n\r]*[ \t]*[-\u2013\u2014][ \t]*\[\s*(https?:\/\/[^\]\s]+)\s*(?:[^\]]*)?\]/g;

const domainsSet = new Set();
let match;

while ((match = domainRegex.exec(wikiContent)) !== null) {
  const rawUrl = match[1];
  try {
    const parsed = new URL(rawUrl);
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith("www.")) hostname = hostname.slice(4);
    domainsSet.add(hostname);
  } catch (e) {
    // skip invalid URLs
  }
}

const domains = Array.from(domainsSet).sort((a, b) =>
  a.localeCompare(b, undefined, { numeric: true }),
);

const tsLines = [
  "// Auto-generated file — do not edit manually",
  "export const MEDIA_WIKI_SITES = [",
  ...domains.map((d) => `  "${d}",`),
  "];",
  "",
];

fs.mkdirSync(path.dirname(domainsPath), { recursive: true });
fs.writeFileSync(domainsPath, tsLines.join("\n"), "utf-8");

console.log(`Generated ${domains.length} domains to ${domainsPath}`);
