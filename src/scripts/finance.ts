import { CATEGORIAS, type Categoria, type DadosFinanceiros } from "./types";

export type ResumoFinanceiro = {
  totalDespesas: number;
  saldoRestante: number;
  totaisPorCategoria: Record<Categoria, number>;
};

export const calculateFinancialSummary = (data: DadosFinanceiros): ResumoFinanceiro => {
  const totaisPorCategoria = Object.fromEntries(
    CATEGORIAS.map((categoria) => [categoria, 0]),
  ) as Record<Categoria, number>;

  const totalDespesas = data.despesas.reduce((total, despesa) => {
    totaisPorCategoria[despesa.categoria] += despesa.valor;
    return total + despesa.valor;
  }, 0);

  return {
    totalDespesas,
    saldoRestante: data.rendaMensal - totalDespesas,
    totaisPorCategoria,
  };
};
