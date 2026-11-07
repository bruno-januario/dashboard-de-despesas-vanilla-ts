const themeToggle = document.querySelector<HTMLButtonElement>("#theme-toggle");

if (!themeToggle) {
  throw new Error("O controle de tema não foi encontrado.");
}

const themeIcon = themeToggle.querySelector("i");

if (!themeIcon) {
  throw new Error("O ícone do controle de tema não foi encontrado.");
}

const setTheme = (theme: "light" | "dark") => {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === "dark";

  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", `Ativar tema ${isDark ? "claro" : "escuro"}`);
  themeIcon.classList.toggle("fa-moon", !isDark);
  themeIcon.classList.toggle("fa-sun", isDark);

  const label = themeToggle.querySelector(".theme-toggle__label");
  if (label) {
    label.textContent = `Tema ${isDark ? "claro" : "escuro"}`;
  }
};

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;
  setTheme(currentTheme === "dark" ? "light" : "dark");
});
