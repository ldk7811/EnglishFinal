import "./style.css";
import { MEDIA_WIKI_SITES } from "../entrypoint_helper/sites-domains.ts";

export default defineContentScript({
  matches: MEDIA_WIKI_SITES.map((domain) => `*://${domain}/*`),
  main() {
    console.log("Hi wikipedia");

    const bg = getComputedStyle(document.documentElement).backgroundColor;
    const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const [r, g, b] = [+match[1], +match[2], +match[3]];
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      document.documentElement.style.setProperty(
        "--revealed-text-color",
        luminance < 0.5 ? "#eaecf0" : "#202122",
      );
    }

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
