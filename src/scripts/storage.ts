import { CATEGORIAS, type DadosFinanceiros, type Despesa } from "./types";

const STORAGE_KEY = "finora:financial-data:v1";
const EMPTY_DATA: DadosFinanceiros = { rendaMensal: 0, despesas: [] };

const isDespesa = (value: unknown): value is Despesa => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const expense = value as Record<string, unknown>;
  return (
    typeof expense.id === "string" &&
    typeof expense.titulo === "string" &&
    expense.titulo.trim().length > 0 &&
    typeof expense.categoria === "string" &&
    CATEGORIAS.includes(expense.categoria as (typeof CATEGORIAS)[number]) &&
    typeof expense.valor === "number" &&
    Number.isFinite(expense.valor) &&
    expense.valor > 0 &&
    (expense.estadoPagamento === "paga" || expense.estadoPagamento === "em-aberto")
  );
};

const isDadosFinanceiros = (value: unknown): value is DadosFinanceiros => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;
  return (
    typeof data.rendaMensal === "number" &&
    Number.isFinite(data.rendaMensal) &&
    data.rendaMensal >= 0 &&
    Array.isArray(data.despesas) &&
    data.despesas.every(isDespesa)
  );
};

export const loadFinancialData = (): DadosFinanceiros => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData === null) {
    return { ...EMPTY_DATA, despesas: [] };
  }

  let parsedData: unknown;
  try {
    parsedData = JSON.parse(storedData);
  } catch (error) {
    throw new Error("Os dados financeiros salvos estão corrompidos.", { cause: error });
  }

  if (!isDadosFinanceiros(parsedData)) {
    throw new Error("Os dados financeiros salvos têm um formato inválido.");
  }

  return parsedData;
};

export const saveFinancialData = (data: DadosFinanceiros): void => {
  if (!isDadosFinanceiros(data)) {
    throw new Error("Não foi possível salvar dados financeiros inválidos.");
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("finora:data-changed"));
};
