# Lbook

**React** · **Vite** · **Tailwind CSS** · **Express** · **Node.js** · **PostgreSQL** · **Multer**

![Node.js](https://img.shields.io/badge/Node.js-black?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169e1?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)

Caderno pessoal de leituras: catalogar o que você tem, organizar por status, avaliar, escrever resenhas e acompanhar o progresso — tudo em uma Estante simples.

**Demo:** [adryan1-dev.github.io/lbook](https://adryan1-dev.github.io/lbook/) — estante no navegador, sem login. A API + PostgreSQL é o modo de desenvolvimento (`npm run dev`).

[Visão geral](#visão-geral) · [Demo](#demo) · [Stack](#stack) · [Funcionalidades](#funcionalidades) · [Começando](#começando) · [Arquitetura](#arquitetura) · [API](#api) · [Estrutura](#estrutura-do-projeto) · [Glossário](#glossário)

---

## Demo

A URL pública é o frontend estático no GitHub Pages. Cada visitante tem a própria Estante no `localStorage` (sem conta, sem banco). Na primeira visita o app popula algumas leituras de exemplo.

`npm run dev` **não** usa esse modo: client e server falam com PostgreSQL, como antes.

O deploy roda em push para a branch `demo/local-pages` (`.github/workflows/deploy.yml`). Na primeira vez, em **Settings → Pages → Source**, escolha **GitHub Actions**. O `main` permanece com Express + PostgreSQL.

---

## Stack

O Lbook é um monorepo npm workspaces com frontend e API separados:

| Camada | Tecnologia | Papel |
| --- | --- | --- |
| UI | **React** + **Vite** | Estante, formulários, busca e modais |
| Estilo | **Tailwind CSS** (`@tailwindcss/vite`) | Layout e identidade visual |
| API | **Node.js** + **Express** | REST, validação de status, schema no boot |
| Upload | **Multer** | Capa da leitura em `server/uploads` |
| Dados | **PostgreSQL** (`pg`) | Persistência da tabela `books` |
| Dev | **concurrently** | Sobe client + server com `npm run dev` |

Proxy do Vite encaminha `/api` e `/uploads` para a API (`VITE_API_TARGET`, padrão `http://localhost:3000`).

---

## Visão geral

Cada item da Estante é uma **Leitura** (não um “livro” na UI): título, autor, capa, status, notas opcionais e resenha.

A aba **Minha biblioteca** lista **todas** as leituras do banco e inclui busca por título/autor — útil para responder “você tem esse?”. No cadastro, **Minha biblioteca** também é o status padrão para o que você já possui e ainda não leu.

Demais status recortam a Estante: Quero comprar, Lendo, Lido, Abandonei.

> [!TIP]
> Vocabulário do produto (Leitura, Estante, Edição, etc.) vive em [`CONTEXT.md`](CONTEXT.md). Use-o ao escrever UI ou docs.

---

## Funcionalidades

- **Catálogo e status** — Minha biblioteca (catálogo completo), Quero comprar, Lendo, Lido, Abandonei
- **Busca** — filtro por título ou autor (acentos ignorados)
- **Avaliação** — quatro categorias (Enredo, Personagens, Edição, Final) em Lendo/Lido; média com uma casa decimal
- **Resenha** — texto livre em qualquer status
- **Progresso** — página atual / total e barra de % apenas em Lendo
- **Capa** — upload de imagem via multipart
- **CRUD** — criar, editar, trocar status e excluir

---

## Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) LTS (recomendado 20+)
- [PostgreSQL](https://www.postgresql.org/download/) local em execução
- npm (vem com o Node)

### 1. Banco de dados

No PostgreSQL, crie o database:

```sql
CREATE DATABASE lbook;
```

### 2. Clone e instale

```bash
git clone https://github.com/adryan1-dev/lbook.git
cd lbook
npm install
```

### 3. Variáveis de ambiente

```bash
cp server/.env.example server/.env
```

Edite `server/.env`:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/lbook
```

Opcional:

```env
PORT=3000
```

Se a API não estiver em `:3000`, alinhe o proxy do Vite:

```env
VITE_API_TARGET=http://localhost:PORTA
```

> [!IMPORTANT]
> Client e server precisam apontar para a **mesma** porta da API. Se `:3000` estiver ocupada, o server encerra com erro (não muda de porta sozinho), para o proxy do Vite não ficar “cego”.

### 4. Suba o app

Na raiz do monorepo:

```bash
npm run dev
```

Isso sobe:

- API em `http://localhost:3000` (schema criado/atualizado no boot)
- UI em `http://localhost:5173`

Abra o Vite no navegador e use a Estante.

### Scripts úteis

| Comando | Onde | O que faz |
| --- | --- | --- |
| `npm run dev` | raiz | Client + server juntos |
| `npm run dev -w lbook-client` | client | Só Vite |
| `npm run build -w lbook-client` | client | Build de produção |
| `npm run dev -w lbook-server` | server | API com `--watch` |

Há também `server/src/init-db.js` para preparar a tabela `books` de forma avulsa, se preferir não depender só do `ensureSchema` do server.

---

## Arquitetura

```text
Browser (React + Vite :5173)
        │  /api/*  /uploads/*
        ▼
   Vite proxy
        │
        ▼
Express API (:3000) ── Multer ──► server/uploads/
        │
        ▼
   PostgreSQL (books)
```

```mermaid
flowchart LR
  User[Usuário] --> UI[React_Vite]
  UI -->|FormData_CRUD| API[Express]
  API -->|capa| Disk[uploads]
  API -->|SQL| DB[(PostgreSQL)]
  API -->|JSON| UI
```

### Fluxo de uma Leitura

1. Na Estante, o usuário abre **Adicionar à estante** (status padrão: Minha biblioteca).
2. O client envia `multipart/form-data` (`title`, `author`, `status`, notas, `review`, opcionalmente `image`, e em Lendo `current_page` / `total_pages`).
3. A API valida o status, aplica regras de notas (só persiste novas notas em `lendo` / `lido`) e grava em `books`.
4. O client recarrega a lista; **Minha biblioteca** mostra o catálogo completo com badge de status.
5. Em **Lendo**, a barra de progresso usa `current_page / total_pages`.

### Regras de negócio (resumo)

| Regra | Comportamento |
| --- | --- |
| Status válidos | `biblioteca`, `quero_comprar`, `lendo`, `lido`, `abandonei` |
| Notas | Editáveis em Lendo e Lido; ao sair desses status, valores existentes são preservados |
| Progresso | Só na UI de Lendo; páginas persistidas no banco |
| Aba Minha biblioteca | `all` — todas as linhas de `books` |
| Status Minha biblioteca | `biblioteca` — default no create (“possuo, ainda não li”) |

---

## API

Base: `http://localhost:3000` (via proxy, use `/api/...` no browser).

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/books` | Lista leituras (`ORDER BY id DESC`) |
| `POST` | `/api/books` | Cria (multipart: `image` opcional) |
| `PUT` | `/api/books/:id` | Atualiza |
| `DELETE` | `/api/books/:id` | Remove (`204`) |

Campos principais do body (form fields): `title`, `author`, `status`, `story`, `characters`, `edition`, `final`, `review`, `current_page`, `total_pages`.

Arquivos estáticos: `GET /uploads/<arquivo>`.

---

## Estrutura do projeto

```text
lbook/
├── client/                 # React + Vite + Tailwind
│   └── src/
│       ├── components/     # Estante, cards, modais, abas, busca, progresso
│       └── lib/            # store.js, api.js, localStore.js, readings.js
├── .github/workflows/      # GitHub Pages (demo com dados no navegador)
├── server/                 # Express + pg + multer
│   ├── src/
│   │   ├── server.js       # API + ensureSchema
│   │   └── init-db.js      # Bootstrap opcional do schema
│   ├── uploads/            # Capas enviadas
│   └── .env.example
├── CONTEXT.md              # Glossário do produto
└── package.json            # workspaces + npm run dev
```

---

## Glossário

Termos estáveis da interface:

| Termo | Significado |
| --- | --- |
| **Leitura** | Unidade da Estante (card) |
| **Estante** | Tela principal / conjunto de Leituras |
| **Minha biblioteca** | Aba = catálogo todo; no form = status “possuo / ainda não li” |
| **Edição** | Categoria de nota do objeto físico (não o ato de editar) |
| **Média da leitura** | Média das quatro notas (`final_rating`) |

Detalhes e palavras a evitar: [`CONTEXT.md`](CONTEXT.md).

---

## Troubleshooting

> [!NOTE]
> A maioria dos problemas locais vem de `DATABASE_URL` ausente ou porta da API desalinhada do proxy Vite.

| Sintoma | O que checar |
| --- | --- |
| “Backend offline” / estante não carrega | `npm run dev` na raiz; `server/.env` com `DATABASE_URL` |
| Erro ao preparar o banco | PostgreSQL no ar; database `lbook` criado; senha correta na URL |
| Porta ocupada | Liberar `:3000` ou definir `PORT` e o mesmo valor em `VITE_API_TARGET` |
| Capa não aparece | Confirme proxy `/uploads` e que o arquivo existe em `server/uploads` |

---

## Próximos passos (visão)

Ideias alinhadas ao roadmap do produto (ainda não implementadas):

- Busca/filtros avançados (nota, autor, etc.)
- Ranking / favoritos
- Autenticação e estantes por usuário
- Histórico de datas e evolução de notas
- Painel de estatísticas
