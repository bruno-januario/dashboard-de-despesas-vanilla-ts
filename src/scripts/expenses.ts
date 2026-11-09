import { loadFinancialData, saveFinancialData } from "./storage";
import { CATEGORIAS, type Categoria, type DadosFinanceiros, type Despesa } from "./types";

const form = document.querySelector<HTMLFormElement>("#expense-form");
const titleInput = document.querySelector<HTMLInputElement>("#expense-title");
const categoryInput = document.querySelector<HTMLSelectElement>("#expense-category");
const amountInput = document.querySelector<HTMLInputElement>("#expense-amount");
const feedback = document.querySelector<HTMLParagraphElement>("#expense-feedback");
const expenseList = document.querySelector<HTMLElement>("#expense-list");
const expenseCount = document.querySelector<HTMLElement>("#expense-count");
const openExpenseCount = document.querySelector<HTMLElement>("#open-expense-count");
const refreshButton = document.querySelector<HTMLButtonElement>(".refresh-button");
const searchInput = document.querySelector<HTMLInputElement>(".search-field input");
const categoryFilter = document.querySelector<HTMLSelectElement>("#filter-category");
const statusFilter = document.querySelector<HTMLSelectElement>("#filter-status");
const minimumAmountFilter = document.querySelector<HTMLInputElement>("#filter-min-amount");
const maximumAmountFilter = document.querySelector<HTMLInputElement>("#filter-max-amount");
const filterFeedback = document.querySelector<HTMLParagraphElement>("#filter-feedback");
const editDialog = document.querySelector<HTMLDialogElement>("#edit-expense-dialog");
const editForm = document.querySelector<HTMLFormElement>("#edit-expense-form");
const editTitleInput = document.querySelector<HTMLInputElement>("#edit-expense-title");
const editCategoryInput = document.querySelector<HTMLSelectElement>("#edit-expense-category");
const editAmountInput = document.querySelector<HTMLInputElement>("#edit-expense-amount");
const editDialogFeedback = document.querySelector<HTMLParagraphElement>("#edit-dialog-feedback");
const deleteDialog = document.querySelector<HTMLDialogElement>("#delete-expense-dialog");
const deleteDescription = document.querySelector<HTMLParagraphElement>("#delete-dialog-description");
const deleteDialogFeedback = document.querySelector<HTMLParagraphElement>("#delete-dialog-feedback");
const confirmDeleteButton = document.querySelector<HTMLButtonElement>("#confirm-delete-expense");

if (
  !form || !titleInput || !categoryInput || !amountInput || !feedback || !expenseList ||
  !expenseCount || !openExpenseCount || !refreshButton || !searchInput || !categoryFilter ||
  !statusFilter || !minimumAmountFilter || !maximumAmountFilter || !filterFeedback ||
  !editDialog || !editForm || !editTitleInput || !editCategoryInput || !editAmountInput ||
  !editDialogFeedback || !deleteDialog || !deleteDescription || !deleteDialogFeedback ||
  !confirmDeleteButton
) {
  throw new Error("Não foi possível inicializar a lista de despesas.");
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
let editingExpenseId: string | null = null;
let deletingExpenseId: string | null = null;

const setFeedback = (
  element: HTMLElement,
  message: string,
  state: "error" | "success" = "success",
): void => {
  element.textContent = message;
  element.classList.toggle("field-hint--error", state === "error");
  element.classList.toggle("field-hint--success", state === "success");
};

const clearFilters = (): void => {
  searchInput.value = "";
  categoryFilter.value = "";
  statusFilter.value = "";
  minimumAmountFilter.value = "";
  maximumAmountFilter.value = "";
  renderExpenses();
};

const createEmptyState = (filtered: boolean): HTMLElement => {
  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";

  const art = document.createElement("span");
  art.className = "empty-state__art";
  art.setAttribute("aria-hidden", "true");
  const icon = document.createElement("i");
  icon.className = filtered ? "fa-solid fa-magnifying-glass" : "fa-solid fa-mug-hot";
  const firstSpark = document.createElement("span");
  firstSpark.className = "empty-state__spark empty-state__spark--one";
  const secondSpark = document.createElement("span");
  secondSpark.className = "empty-state__spark empty-state__spark--two";
  art.append(icon, firstSpark, secondSpark);

  const title = document.createElement("h3");
  title.textContent = filtered ? "Nenhuma despesa encontrada" : "Tudo tranquilo por aqui";
  const description = document.createElement("p");
  description.textContent = filtered
    ? "Tente ajustar os filtros ou limpe a pesquisa para ver suas despesas."
    : "Suas despesas aparecerão aqui. Comece registrando o primeiro gasto.";
  emptyState.append(art, title, description);

  if (filtered) {
    const clearButton = document.createElement("button");
    clearButton.className = "button button--quiet";
    clearButton.type = "button";
    clearButton.textContent = "Limpar filtros";
    clearButton.addEventListener("click", clearFilters);
    emptyState.append(clearButton);
  }
  return emptyState;
};

const createActionButton = (
  label: string,
  iconName: string,
  action: () => void,
  className = "expense-card__action",
): HTMLButtonElement => {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.setAttribute("aria-label", label);
  const icon = document.createElement("i");
  icon.className = `fa-solid ${iconName}`;
  icon.setAttribute("aria-hidden", "true");
  button.append(icon);
  button.addEventListener("click", action);
  return button;
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

  const actions = document.createElement("div");
  actions.className = "expense-card__actions";
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
  toggleLabel.textContent = expense.estadoPagamento === "paga" ? "Reabrir" : "Marcar paga";
  toggleButton.append(toggleIcon, toggleLabel);
  toggleButton.addEventListener("click", () => togglePaymentStatus(expense.id));
  actions.append(
    toggleButton,
    createActionButton(`Editar despesa: ${expense.titulo}`, "fa-pen", () => openEditDialog(expense)),
    createActionButton(
      `Excluir despesa: ${expense.titulo}`,
      "fa-trash",
      () => openDeleteDialog(expense),
      "expense-card__action expense-card__action--danger",
    ),
  );

  card.append(heading, details, actions);
  return card;
};

const hasActiveFilters = (): boolean =>
  Boolean(
    searchInput.value.trim() ||
    categoryFilter.value ||
    statusFilter.value ||
    minimumAmountFilter.value ||
    maximumAmountFilter.value,
  );

const getFilteredExpenses = (expenses: Despesa[]): Despesa[] => {
  const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const minimum = minimumAmountFilter.value === "" ? null : minimumAmountFilter.valueAsNumber;
  const maximum = maximumAmountFilter.value === "" ? null : maximumAmountFilter.valueAsNumber;

  if (
    (minimum !== null && (!Number.isFinite(minimum) || minimum < 0)) ||
    (maximum !== null && (!Number.isFinite(maximum) || maximum < 0))
  ) {
    throw new Error("Informe limites de valor válidos.");
  }
  if (minimum !== null && maximum !== null && minimum > maximum) {
    throw new Error("O valor mínimo não pode ser maior que o valor máximo.");
  }

  return expenses.filter((expense) =>
    expense.titulo.toLocaleLowerCase("pt-BR").includes(query) &&
    (!categoryFilter.value || expense.categoria === categoryFilter.value) &&
    (!statusFilter.value || expense.estadoPagamento === statusFilter.value) &&
    (minimum === null || expense.valor >= minimum) &&
    (maximum === null || expense.valor <= maximum),
  );
};

const renderExpenses = (): void => {
  let data: DadosFinanceiros;
  try {
    data = loadFinancialData();
  } catch (error) {
    console.error("Falha ao carregar as despesas salvas.", error);
    expenseList.replaceChildren();
    expenseList.setAttribute("aria-label", "Não foi possível carregar as despesas salvas.");
    const errorMessage = document.createElement("p");
    errorMessage.className = "expense-list__error";
    errorMessage.setAttribute("role", "alert");
    errorMessage.textContent = "Não foi possível carregar as despesas salvas. Verifique o armazenamento do navegador.";
    expenseList.append(errorMessage);
    return;
  }

  const openCount = data.despesas.filter((expense) => expense.estadoPagamento === "em-aberto").length;
  expenseCount.textContent = `${data.despesas.length} ${data.despesas.length === 1 ? "despesa" : "despesas"}`;
  openExpenseCount.textContent = `${openCount} em aberto`;

  let filteredExpenses: Despesa[];
  try {
    filteredExpenses = getFilteredExpenses(data.despesas);
    setFeedback(filterFeedback, "");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível aplicar os filtros.";
    setFeedback(filterFeedback, message, "error");
    expenseList.replaceChildren(...data.despesas.map(createExpenseCard));
    expenseList.removeAttribute("aria-label");
    return;
  }

  const content = document.createDocumentFragment();
  if (filteredExpenses.length === 0) {
    content.append(createEmptyState(hasActiveFilters()));
  } else {
    filteredExpenses.forEach((expense) => content.append(createExpenseCard(expense)));
  }

  expenseList.replaceChildren(content);
  expenseList.removeAttribute("aria-label");
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
    setFeedback(feedback, "Não foi possível atualizar o estado da despesa. Tente novamente.", "error");
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
    setFeedback(feedback, "Informe o título da despesa.", "error");
    titleInput.focus();
    return;
  }
  if (!isCategoria(category)) {
    setFeedback(feedback, "Selecione uma categoria válida.", "error");
    categoryInput.focus();
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    setFeedback(feedback, "Informe um valor maior que zero.", "error");
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
    setFeedback(feedback, "Despesa adicionada.", "success");
    titleInput.focus();
  } catch (error) {
    console.error("Falha ao cadastrar a despesa.", error);
    setFeedback(feedback, "Não foi possível salvar a despesa. Tente novamente.", "error");
  }
};

const openEditDialog = (expense: Despesa): void => {
  editingExpenseId = expense.id;
  editTitleInput.value = expense.titulo;
  editCategoryInput.value = expense.categoria;
  editAmountInput.value = String(expense.valor);
  setFeedback(editDialogFeedback, "");
  editDialog.showModal();
  editTitleInput.focus();
};

const saveExpenseEdits = (event: SubmitEvent): void => {
  event.preventDefault();
  const title = editTitleInput.value.trim();
  const category = editCategoryInput.value;
  const amount = editAmountInput.valueAsNumber;

  if (!editingExpenseId) {
    setFeedback(editDialogFeedback, "Não foi possível identificar a despesa.", "error");
    return;
  }
  if (!title) {
    setFeedback(editDialogFeedback, "Informe o título da despesa.", "error");
    editTitleInput.focus();
    return;
  }
  if (!isCategoria(category)) {
    setFeedback(editDialogFeedback, "Selecione uma categoria válida.", "error");
    editCategoryInput.focus();
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    setFeedback(editDialogFeedback, "Informe um valor maior que zero.", "error");
    editAmountInput.focus();
    return;
  }

  try {
    const data = loadFinancialData();
    const expense = data.despesas.find((item) => item.id === editingExpenseId);
    if (!expense) {
      throw new Error("A despesa selecionada não foi encontrada.");
    }
    expense.titulo = title;
    expense.categoria = category;
    expense.valor = amount;
    saveFinancialData(data);
    editDialog.close();
    editingExpenseId = null;
    setFeedback(feedback, "Despesa atualizada.", "success");
  } catch (error) {
    console.error("Falha ao editar a despesa.", error);
    setFeedback(editDialogFeedback, "Não foi possível salvar as alterações. Tente novamente.", "error");
  }
};

const openDeleteDialog = (expense: Despesa): void => {
  deletingExpenseId = expense.id;
  deleteDescription.textContent = `A despesa “${expense.titulo}” será removida permanentemente. Esta ação não pode ser desfeita.`;
  setFeedback(deleteDialogFeedback, "");
  deleteDialog.showModal();
  confirmDeleteButton.focus();
};

const deleteExpense = (): void => {
  if (!deletingExpenseId) {
    setFeedback(deleteDialogFeedback, "Não foi possível identificar a despesa.", "error");
    return;
  }

  try {
    const data = loadFinancialData();
    const remainingExpenses = data.despesas.filter((expense) => expense.id !== deletingExpenseId);
    if (remainingExpenses.length === data.despesas.length) {
      throw new Error("A despesa selecionada não foi encontrada.");
    }
    saveFinancialData({ ...data, despesas: remainingExpenses });
    deleteDialog.close();
    deletingExpenseId = null;
    setFeedback(feedback, "Despesa excluída.", "success");
  } catch (error) {
    console.error("Falha ao excluir a despesa.", error);
    setFeedback(deleteDialogFeedback, "Não foi possível excluir a despesa. Tente novamente.", "error");
  }
};

form.addEventListener("submit", addExpense);
form.addEventListener("input", () => {
  if (feedback.classList.contains("field-hint--error")) {
    setFeedback(feedback, "");
  }
});
editForm.addEventListener("submit", saveExpenseEdits);
confirmDeleteButton.addEventListener("click", deleteExpense);
refreshButton.addEventListener("click", renderExpenses);
[searchInput, minimumAmountFilter, maximumAmountFilter].forEach((input) =>
  input.addEventListener("input", renderExpenses),
);
[categoryFilter, statusFilter].forEach((select) => select.addEventListener("change", renderExpenses));
document.querySelectorAll<HTMLButtonElement>("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog")?.close());
});
editDialog.addEventListener("close", () => {
  editingExpenseId = null;
});
deleteDialog.addEventListener("close", () => {
  deletingExpenseId = null;
});
window.addEventListener("finora:data-changed", renderExpenses);
window.addEventListener("storage", (event) => {
  if (event.key === "finora:financial-data:v1") {
    renderExpenses();
  }
});

renderExpenses();
