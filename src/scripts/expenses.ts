import { loadFinancialData, saveFinancialData } from "./storage";
import { CATEGORIAS, type Categoria, type Despesa } from "./types";

const form = document.querySelector<HTMLFormElement>("#expense-form");
const titleInput = document.querySelector<HTMLInputElement>("#expense-title");
const categoryInput = document.querySelector<HTMLSelectElement>("#expense-category");
const amountInput = document.querySelector<HTMLInputElement>("#expense-amount");
const feedback = document.querySelector<HTMLParagraphElement>("#expense-feedback");
const expenseList = document.querySelector<HTMLElement>("#expense-list");
const expenseCount = document.querySelector<HTMLElement>("#expense-count");
const openExpenseCount = document.querySelector<HTMLElement>("#open-expense-count");
const refreshButton = document.querySelector<HTMLButtonElement>(".refresh-button");

if (
  !form ||
  !titleInput ||
  !categoryInput ||
  !amountInput ||
  !feedback ||
  !expenseList ||
  !expenseCount ||
  !openExpenseCount ||
  !refreshButton
) {
  throw new Error("Não foi possível inicializar o cadastro de despesas.");
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const setFeedback = (message: string, state: "error" | "success" = "success"): void => {
  feedback.textContent = message;
  feedback.classList.toggle("field-hint--error", state === "error");
  feedback.classList.toggle("field-hint--success", state === "success");
};

const createEmptyState = (): HTMLElement => {
  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";

  const art = document.createElement("span");
  art.className = "empty-state__art";
  art.setAttribute("aria-hidden", "true");
  const icon = document.createElement("i");
  icon.className = "fa-solid fa-mug-hot";
  const firstSpark = document.createElement("span");
  firstSpark.className = "empty-state__spark empty-state__spark--one";
  const secondSpark = document.createElement("span");
  secondSpark.className = "empty-state__spark empty-state__spark--two";
  art.append(icon, firstSpark, secondSpark);

  const title = document.createElement("h3");
  title.textContent = "Tudo tranquilo por aqui";
  const description = document.createElement("p");
  description.textContent = "Suas despesas aparecerão aqui. Comece registrando o primeiro gasto.";
  emptyState.append(art, title, description);
  return emptyState;
};

const createExpenseCard = (expense: Despesa): HTMLElement => {
  const card = document.createElement("article");
  card.className = `expense-card${expense.estadoPagamento === "paga" ? " expense-card--paid" : ""}`;

  const heading = document.createElement("div");
  heading.className = "expense-card__heading";
  const title = document.createElement("h3");
  title.className = "expense-card__title";
  title.textContent = expense.titulo;
  const status = document.createElement("span");
  status.className = `expense-status expense-status--${expense.estadoPagamento}`;
  status.textContent = expense.estadoPagamento === "paga" ? "Paga" : "Em aberto";
  heading.append(title, status);

  const details = document.createElement("div");
  details.className = "expense-card__details";
  const category = document.createElement("span");
  category.className = "expense-card__category";
  category.textContent = expense.categoria;
  const amount = document.createElement("strong");
  amount.className = "expense-card__amount";
  amount.textContent = currencyFormatter.format(expense.valor);
  details.append(category, amount);

  const toggleButton = document.createElement("button");
  toggleButton.className = "expense-card__toggle";
  toggleButton.type = "button";
  toggleButton.setAttribute("aria-pressed", String(expense.estadoPagamento === "paga"));
  toggleButton.setAttribute(
    "aria-label",
    expense.estadoPagamento === "paga"
      ? `Reabrir despesa: ${expense.titulo}`
      : `Marcar como paga: ${expense.titulo}`,
  );
  const toggleIcon = document.createElement("i");
  toggleIcon.className = `fa-solid ${expense.estadoPagamento === "paga" ? "fa-rotate-left" : "fa-check"}`;
  toggleIcon.setAttribute("aria-hidden", "true");
  const toggleLabel = document.createElement("span");
  toggleLabel.textContent = expense.estadoPagamento === "paga" ? "Reabrir despesa" : "Marcar como paga";
  toggleButton.append(toggleIcon, toggleLabel);
  toggleButton.addEventListener("click", () => togglePaymentStatus(expense.id));

  card.append(heading, details, toggleButton);
  return card;
};

const renderExpenses = (): void => {
  try {
    const data = loadFinancialData();
    const openCount = data.despesas.filter((expense) => expense.estadoPagamento === "em-aberto").length;
    expenseCount.textContent = `${data.despesas.length} ${data.despesas.length === 1 ? "despesa" : "despesas"}`;
    openExpenseCount.textContent = `${openCount} em aberto`;

    const content = document.createDocumentFragment();
    if (data.despesas.length === 0) {
      content.append(createEmptyState());
    } else {
      data.despesas.forEach((expense) => content.append(createExpenseCard(expense)));
    }

    expenseList.replaceChildren(content);
    expenseList.removeAttribute("aria-label");
  } catch (error) {
    console.error("Falha ao carregar as despesas salvas.", error);
    expenseList.replaceChildren();
    expenseList.setAttribute("aria-label", "Não foi possível carregar as despesas salvas.");
    const errorMessage = document.createElement("p");
    errorMessage.className = "expense-list__error";
    errorMessage.setAttribute("role", "alert");
    errorMessage.textContent = "Não foi possível carregar as despesas salvas. Verifique o armazenamento do navegador.";
    expenseList.append(errorMessage);
  }
};

const togglePaymentStatus = (id: string): void => {
  try {
    const data = loadFinancialData();
    const expense = data.despesas.find((item) => item.id === id);
    if (!expense) {
      throw new Error("A despesa selecionada não foi encontrada.");
    }

    expense.estadoPagamento = expense.estadoPagamento === "paga" ? "em-aberto" : "paga";
    saveFinancialData(data);
  } catch (error) {
    console.error("Falha ao atualizar o estado de pagamento da despesa.", error);
    setFeedback("Não foi possível atualizar o estado da despesa. Tente novamente.", "error");
  }
};

const isCategoria = (value: string): value is Categoria =>
  CATEGORIAS.some((category) => category === value);

const addExpense = (event: SubmitEvent): void => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const category = categoryInput.value;
  const amount = amountInput.valueAsNumber;

  if (!title) {
    setFeedback("Informe o título da despesa.", "error");
    titleInput.focus();
    return;
  }
  if (!isCategoria(category)) {
    setFeedback("Selecione uma categoria válida.", "error");
    categoryInput.focus();
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    setFeedback("Informe um valor maior que zero.", "error");
    amountInput.focus();
    return;
  }

  try {
    const data = loadFinancialData();
    const expense: Despesa = {
      id: crypto.randomUUID(),
      titulo: title,
      categoria: category,
      valor: amount,
      estadoPagamento: "em-aberto",
    };
    saveFinancialData({ ...data, despesas: [...data.despesas, expense] });
    form.reset();
    setFeedback("Despesa adicionada.", "success");
    titleInput.focus();
  } catch (error) {
    console.error("Falha ao cadastrar a despesa.", error);
    setFeedback("Não foi possível salvar a despesa. Tente novamente.", "error");
  }
};

form.addEventListener("submit", addExpense);
form.addEventListener("input", () => {
  if (feedback.classList.contains("field-hint--error")) {
    setFeedback("");
  }
});
refreshButton.addEventListener("click", renderExpenses);
window.addEventListener("finora:data-changed", renderExpenses);
window.addEventListener("storage", (event) => {
  if (event.key === "finora:financial-data:v1") {
    renderExpenses();
  }
});

renderExpenses();
