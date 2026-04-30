import "./style.css";
import { MEDIA_WIKI_SITES } from "../entrypoint_helper/sites-domains.ts";
import { WIKIMEDIA_SITES } from "../entrypoint_helper/wikimedia-domains.ts";

export default defineContentScript({
  matches: [...MEDIA_WIKI_SITES, ...WIKIMEDIA_SITES].map((domain) => `*://${domain}/*`),
  main() {
    console.log("Hi wikipedia");

    let dark = false;
    for (const el of [document.documentElement, document.body]) {
      const bg = getComputedStyle(el).backgroundColor;
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!match) continue;
      const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
      if (alpha < 0.1) continue;
      const [r, g, b] = [+match[1], +match[2], +match[3]];
      dark = (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
      break;
    }
    document.documentElement.style.setProperty(
      "--revealed-text-color",
      dark ? "#eaecf0" : "#202122",
    );
    document.documentElement.style.setProperty(
      "--obscured-glow-color",
      dark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
    );

    const attachListener = () => {
      const links = document.querySelectorAll<HTMLAnchorElement>(
        "#bodyContent p a, #bodyContent li a",
      );

      links.forEach((link) => {
        link.addEventListener("mouseenter", reveal);
        link.addEventListener("focus", reveal);
      });
    };

    const reveal = (e: Event) => {
      const target = e.target as HTMLElement;
      const parent = target.closest("p, li");
      if (parent) {
        document.querySelectorAll(".hypertext-revealed").forEach((el) => {
          el.classList.remove("hypertext-revealed");
        });
        parent.classList.add("hypertext-revealed");
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attachListener);
    } else {
      attachListener();
    }
  },
});
