const themeToggle = document.querySelector<HTMLButtonElement>("#theme-toggle");
const THEME_STORAGE_KEY = "finora:theme:v1";

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

let savedTheme: string | null = null;
try {
  savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
} catch (error) {
  console.error("Falha ao carregar a preferência de tema.", error);
}

if (savedTheme === "light" || savedTheme === "dark") {
  setTheme(savedTheme);
} else if (savedTheme !== null) {
  console.error("A preferência de tema salva tem um valor inválido.");
}

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(nextTheme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch (error) {
    console.error("Falha ao salvar a preferência de tema.", error);
  }
});
