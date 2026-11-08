import { calculateFinancialSummary } from "./finance";
import { loadFinancialData, saveFinancialData } from "./storage";
import { CATEGORIAS, type Categoria, type DadosFinanceiros } from "./types";

const incomeInput = document.querySelector<HTMLInputElement>("#monthly-income");
const incomeSaveButton = document.querySelector<HTMLButtonElement>(".income-input__save");
const incomeFeedback = document.querySelector<HTMLParagraphElement>("#income-feedback");
const balanceValue = document.querySelector<HTMLElement>("#remaining-balance");
const expensesValue = document.querySelector<HTMLElement>("#total-expenses");
const chart = document.querySelector<HTMLElement>(".category-chart");
const chartAmount = document.querySelector<HTMLElement>("#category-chart-amount");
const categoryLegend = document.querySelector<HTMLUListElement>(".category-legend");
const refreshButton = document.querySelector<HTMLButtonElement>(".refresh-button");

if (
  !incomeInput ||
  !incomeSaveButton ||
  !incomeFeedback ||
  !balanceValue ||
  !expensesValue ||
  !chart ||
  !chartAmount ||
  !categoryLegend ||
  !refreshButton
) {
  throw new Error("Não foi possível inicializar o resumo financeiro.");
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const defaultIncomeHint = "O valor que você recebe por mês.";
const incomeFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const categoryColors: Record<Categoria, string> = {
  Alimentação: "var(--color-food)",
  Transporte: "var(--color-transport)",
  Saúde: "var(--color-health)",
  Estudo: "var(--color-study)",
  Lazer: "var(--color-leisure)",
  "Contas de casa": "var(--color-home)",
  Outros: "var(--color-other)",
};

const setFeedback = (message: string, state: "error" | "success" | "info" = "info"): void => {
  incomeFeedback.textContent = message;
  incomeFeedback.classList.toggle("field-hint--error", state === "error");
  incomeFeedback.classList.toggle("field-hint--success", state === "success");
};

const showLoadError = (error: unknown): void => {
  console.error("Falha ao carregar os dados financeiros.", error);
  setFeedback("Não foi possível carregar os dados salvos. Verifique o armazenamento do navegador.", "error");
  balanceValue.textContent = "Indisponível";
  expensesValue.textContent = "Indisponível";
  chart.setAttribute("aria-label", "Gráfico indisponível por falha ao carregar os dados.");
  chartAmount.textContent = "—";
};

const renderSummary = (data: DadosFinanceiros): void => {
  const summary = calculateFinancialSummary(data);
  incomeInput.value = incomeFormatter.format(data.rendaMensal);
  balanceValue.textContent = currencyFormatter.format(summary.saldoRestante);
  expensesValue.textContent = currencyFormatter.format(summary.totalDespesas);
  chartAmount.textContent = currencyFormatter.format(summary.totalDespesas);

  const total = summary.totalDespesas;
  let currentPercentage = 0;
  const slices = CATEGORIAS.flatMap((categoria) => {
    const categoryTotal = summary.totaisPorCategoria[categoria];
    if (categoryTotal === 0 || total === 0) {
      return [];
    }

    const start = currentPercentage;
    currentPercentage += (categoryTotal / total) * 100;
    return [`${categoryColors[categoria]} ${start}% ${currentPercentage}%`];
  });

  chart.style.setProperty(
    "--chart-gradient",
    slices.length > 0
      ? `conic-gradient(${slices.join(", ")})`
      : "var(--color-border)",
  );
  chart.setAttribute(
    "aria-label",
    total > 0
      ? `Gráfico de despesas por categoria, total de ${currencyFormatter.format(total)}.`
      : "Gráfico de despesas por categoria, sem dados.",
  );

  categoryLegend.querySelectorAll("li").forEach((item, index) => {
    const amount = item.querySelector("strong");
    const category = CATEGORIAS[index];
    if (amount && category) {
      amount.textContent = currencyFormatter.format(summary.totaisPorCategoria[category]);
    }
  });
};

const refreshSummary = (): void => {
  try {
    renderSummary(loadFinancialData());
    setFeedback(defaultIncomeHint);
  } catch (error) {
    showLoadError(error);
  }
};

const parseIncome = (value: string): number | null => {
  const normalized = value.trim().replace(/\s/g, "");
  if (!normalized) {
    return null;
  }

  const decimalValue = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : /^\d{1,3}(?:\.\d{3})+$/.test(normalized)
      ? normalized.replace(/\./g, "")
      : normalized;
  if (!/^\d+(?:\.\d{1,2})?$/.test(decimalValue)) {
    return null;
  }

  const income = Number(decimalValue);
  return Number.isFinite(income) ? income : null;
};

const saveIncome = (): void => {
  const income = parseIncome(incomeInput.value);
  if (income === null) {
    setFeedback("Informe uma renda válida, como 3500,00.", "error");
    incomeInput.focus();
    return;
  }

  try {
    const data = loadFinancialData();
    saveFinancialData({ ...data, rendaMensal: income });
    setFeedback("Renda salva.", "success");
  } catch (error) {
    console.error("Falha ao salvar a renda mensal.", error);
    setFeedback("Não foi possível salvar a renda. Tente novamente.", "error");
  }
};

incomeSaveButton.addEventListener("click", saveIncome);
incomeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveIncome();
  }
});
incomeInput.addEventListener("input", () => setFeedback(""));
refreshButton.addEventListener("click", refreshSummary);
window.addEventListener("storage", (event) => {
  if (event.key === "finora:financial-data:v1") {
    refreshSummary();
  }
});
window.addEventListener("finora:data-changed", refreshSummary);

refreshSummary();
