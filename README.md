# Finora: Seu Painel de Despesas Pessoais

<div align="center">
  <img src="./public/logo.webp" alt="Logo do Finora" width="112" />
  <h1>Finora</h1>
  <p><strong>Suas finanças em equilíbrio.</strong></p>
  <p>Um jeito simples e pessoal de acompanhar sua renda e suas despesas.</p>
  <a href="https://bruno-januario.github.io/dashboard-de-despesas-vanilla-ts/">
    <img src="https://img.shields.io/badge/Acessar%20projeto-online-0F9F59?style=for-the-badge" alt="Acessar o Finora online" />
  </a>
</div>

## Sobre o projeto

O **Finora** é um painel (dashboard) para organizar despesas pessoais, acompanhar pagamentos e visualizar o impacto dos gastos sobre a renda mensal. A interface é responsiva, oferece temas claro e escuro e salva os dados no navegador — sem conta ou back-end.

> Seus dados financeiros ficam no armazenamento local do navegador (`localStorage`).

## Funcionalidades

- Definição e acompanhamento da renda mensal, do total de despesas e do saldo restante.
- Gráfico e resumo de gastos por categoria.
- Cadastro, edição e exclusão de despesas.
- Marcação de despesas como pagas ou em aberto.
- Pesquisa por título e filtros por categoria, valor e estado de pagamento.
- Alternância entre os temas claro e escuro.
- Persistência dos dados no navegador.
- Layout adaptável para dispositivos móveis e desktop.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| HTML | Estrutura da aplicação |
| CSS | Estilos, temas e layout responsivo |
| TypeScript | Lógica e interações da aplicação |
| Vite | Desenvolvimento e build |
| `localStorage` | Persistência local dos dados |

## Comece a usar

### Requisitos

- [Node.js](https://nodejs.org/) e npm

### Instalação e desenvolvimento

```bash
git clone https://github.com/bruno-januario/dashboard-de-despesas-vanilla-ts.git
cd dashboard-de-despesas-vanilla-ts
npm install
npm run dev
```

O Vite informará no terminal o endereço local para abrir no navegador.

### Build de produção

```bash
npm run build
```

Para visualizar localmente a versão gerada:

```bash
npm run preview
```

## Estrutura do projeto

```text
.
├── public/          # Recursos públicos, incluindo a logo
├── src/
│   ├── scripts/     # Lógica, dados e funcionalidades
│   ├── styles/      # Estilos da aplicação
│   └── main.ts      # Ponto de entrada
├── index.html       # Estrutura HTML da aplicação
└── package.json     # Dependências de desenvolvimento
```

## Privacidade

Renda e despesas são armazenadas no `localStorage` do navegador em que o Finora é utilizado. Os dados não são enviados a um servidor e não são sincronizados entre dispositivos ou navegadores.

## Autor

Desenvolvido por **Bruno Januário**.

- [GitHub](https://github.com/bruno-januario)
- [LinkedIn](https://www.linkedin.com/in/dev-bruno-januario)

## Licença

Este projeto está sob a MIT License definida em [`LICENSE`](./LICENSE).
