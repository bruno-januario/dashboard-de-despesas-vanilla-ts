export type Categoria =
  | "Alimentação"
  | "Transporte"
  | "Saúde"
  | "Estudo"
  | "Lazer"
  | "Contas de casa"
  | "Outros";

export const CATEGORIAS: readonly Categoria[] = [
  "Alimentação",
  "Transporte",
  "Saúde",
  "Estudo",
  "Lazer",
  "Contas de casa",
  "Outros",
];

export type EstadoPagamento = "paga" | "em-aberto";

export type Despesa = {
  id: string;
  titulo: string;
  categoria: Categoria;
  valor: number;
  estadoPagamento: EstadoPagamento;
};
