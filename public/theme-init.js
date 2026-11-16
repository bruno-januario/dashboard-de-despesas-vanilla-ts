try {
  const savedTheme = localStorage.getItem("finora:theme:v1");
  if (savedTheme === "light" || savedTheme === "dark") {
    document.documentElement.dataset.theme = savedTheme;
  }
} catch (error) {
  console.error("Falha ao carregar a preferência de tema.", error);
}
