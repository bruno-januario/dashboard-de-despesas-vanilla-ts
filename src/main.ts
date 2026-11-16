import "./scripts/theme";
import "./scripts/dashboard";
import "./scripts/expenses";

const startupSplash = document.querySelector<HTMLElement>("#startup-splash");

if (!startupSplash) {
  throw new Error("A tela de inicialização não foi encontrada.");
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const startupDuration = prefersReducedMotion ? 250 : 1800;

window.setTimeout(() => {
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-ready");
  document.querySelector(".app-shell")?.removeAttribute("inert");
  startupSplash.setAttribute("aria-hidden", "true");

  if (prefersReducedMotion) {
    startupSplash.hidden = true;
    return;
  }

  startupSplash.classList.add("startup-splash--leaving");
  window.setTimeout(() => {
    startupSplash.hidden = true;
  }, 520);
}, startupDuration);