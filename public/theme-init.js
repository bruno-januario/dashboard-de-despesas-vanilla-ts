try {
  const savedTheme = localStorage.getItem("finora:theme:v1");
  if (savedTheme === "light" || savedTheme === "dark") {
    document.documentElement.dataset.theme = savedTheme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", savedTheme === "dark" ? "#101b17" : "#f4f7f5");
    }
  }
} catch (error) {
  console.error("Falha ao carregar a preferência de tema.", error);
}
