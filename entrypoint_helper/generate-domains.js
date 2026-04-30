import fs from "fs";
import path from "path";
import { URL } from "url";
import https from "https";

// --- Generate MEDIA_WIKI_SITES from local wiki page source ---

const wikiPagePath = path.resolve(
  "entrypoint_helper/Sites_using_MediaWiki.wiki_page_source",
);
const domainsPath = path.resolve("entrypoint_helper/sites-domains.ts");

if (!fs.existsSync(wikiPagePath)) {
  console.error(`Input file not found: ${wikiPagePath}`);
  process.exit(1);
}

const wikiContent = fs.readFileSync(wikiPagePath, "utf-8");

const domainRegex =
  /;[^-\n\r]*[ \t]*[-–—][ \t]*\[\s*(https?:\/\/[^\]\s]+)\s*(?:[^\]]*)?\]/g;

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

// --- Generate WIKIMEDIA_SITES by fetching the rendered Wikimedia page ---

const wikimediaDomainsPath = path.resolve("entrypoint_helper/wikimedia-domains.ts");
const wikimediaUrl = "https://www.mediawiki.org/wiki/Sites_using_MediaWiki/Wikimedia";

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "generate-domains-script/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchHtml(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

const html = await fetchHtml(wikimediaUrl);
const hrefRegex = /href="(https?:\/\/[^"]+)"/g;
const wmDomainsSet = new Set();
let wmMatch;

while ((wmMatch = hrefRegex.exec(html)) !== null) {
  try {
    const parsed = new URL(wmMatch[1]);
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith("www.")) hostname = hostname.slice(4);
    wmDomainsSet.add(hostname);
  } catch (e) {
    // skip invalid URLs
  }
}

const wmDomains = Array.from(wmDomainsSet).sort((a, b) =>
  a.localeCompare(b, undefined, { numeric: true }),
);

const wmTsLines = [
  "// Auto-generated file — do not edit manually",
  "export const WIKIMEDIA_SITES = [",
  ...wmDomains.map((d) => `  "${d}",`),
  "];",
  "",
];

fs.writeFileSync(wikimediaDomainsPath, wmTsLines.join("\n"), "utf-8");
console.log(`Generated ${wmDomains.length} Wikimedia domains to ${wikimediaDomainsPath}`);
