import "./style.css";
import { MEDIA_WIKI_SITES } from "./sites-domains";

export default defineContentScript({
  matches: MEDIA_WIKI_SITES.map((domain) => `*://${domain}/*`),
  main() {
    console.log("Hi wikipedia");
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
            document.querySelectorAll(".hypertext-revealed").forEach(el => {
                el.classList.remove("hypertext-revealed");
            });
            parent.classList.add("hypertext-revealed")
        }
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", attachListener);
    } else {
        attachListener();
    }
  },
});
