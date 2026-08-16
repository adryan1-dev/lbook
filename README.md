# Lbook

**React** · **Vite** · **Tailwind CSS** · **Supabase** · **PostgreSQL**

![React](https://img.shields.io/badge/React-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169e1?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)

Caderno pessoal de leituras: catalogar o que você tem, organizar por status, avaliar, escrever resenhas e acompanhar o progresso — tudo em uma Estante simples.

**Demo:** [adryan1-dev.github.io/lbook](https://adryan1-dev.github.io/lbook/) — estante no navegador, sem login.

**App (conta + nuvem):** deploy na Vercel com Supabase — cada pessoa tem a própria Estante, acessível de qualquer lugar.

[Visão geral](#visão-geral) · [Modos](#modos) · [App com login](#app-com-login) · [Demo](#demo) · [Stack](#stack) · [Começando](#começando) · [Arquitetura](#arquitetura) · [Estrutura](#estrutura-do-projeto) · [Glossário](#glossário)

---

## Modos

Um único `main` compartilha UI e componentes; a persistência muda no build:

| Modo | URL | Persistência | Login |
| --- | --- | --- | --- |
| **App** | Vercel (ex.: `lbook.vercel.app`) | Supabase Postgres + Storage | Sim — estante por conta |
| **Demo** | GitHub Pages | `localStorage` (`VITE_DATA_SOURCE=local`) | Não |
| **Legado** | `npm run dev` (local) | Express + PostgreSQL local | Não |

---

## App com login

O app de produção usa **Supabase** (auth + banco + capas) e **Vercel** (frontend). Cada conta vê só a própria Estante — RLS no Postgres garante o isolamento.

### Setup Supabase (uma vez)

1. Crie um projeto gratuito em [supabase.com](https://supabase.com) (região próxima, ex. `sa-east-1`).
2. Rode o SQL em [`supabase/migrations/001_books_auth.sql`](supabase/migrations/001_books_auth.sql) no SQL Editor.
3. **Authentication → Providers → Email** — habilitado; **Confirm email** — desligado na v1.
4. Copie **Project URL** e **anon key** (Settings → API).

Detalhes: [`supabase/README.md`](supabase/README.md).

### Deploy Vercel (uma vez)

1. Importe o repo `adryan1-dev/lbook` na [Vercel](https://vercel.com).
2. O [`vercel.json`](vercel.json) na raiz já aponta o build para `client/`.
3. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Após o deploy, em **Supabase → Authentication → URL Configuration**, defina **Site URL** = URL da Vercel.

### Desenvolvimento local (App)

```bash
cp client/.env.example client/.env
# preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

npm install
npm run dev:app
```

Abra `http://localhost:5173`, crie uma conta e use a Estante.

---

## Demo

A URL pública é o frontend estático no GitHub Pages. Cada visitante tem a própria Estante no `localStorage` (sem conta, sem banco). Na primeira visita o app popula algumas leituras de exemplo.

O deploy do demo roda em push para `main` (`.github/workflows/deploy.yml`). Na primeira vez, em **Settings → Pages → Source**, escolha **GitHub Actions**.

---

## Stack

| Camada | App (produção) | Demo | Legado (local) |
| --- | --- | --- | --- |
| UI | React + Vite | React + Vite | React + Vite |
| Estilo | Tailwind CSS v4 | Tailwind CSS v4 | Tailwind CSS v4 |
| Auth | Supabase Auth | — | — |
| Dados | Supabase Postgres + RLS | `localStorage` | PostgreSQL (`pg`) |
| Capas | Supabase Storage | base64 no browser | Multer → `server/uploads` |
| Hospedagem | Vercel | GitHub Pages | localhost |

---

## Visão geral

Cada item da Estante é uma **Leitura** (não um “livro” na UI): título, autor, capa, status, notas opcionais e resenha.

A **Estante** lista todas as leituras da conta, um vão por status, com busca por título/autor. No cadastro, **Minha biblioteca** é o status padrão para o que você já possui e ainda não leu.

> [!TIP]
> Vocabulário do produto (Leitura, Estante, Edição, etc.) vive em [`CONTEXT.md`](CONTEXT.md).

---

## Funcionalidades

- **Conta pessoal** — nome de usuário único, confirmação de senha no cadastro; entrar com email ou username
- **Catálogo e status** — Estante em vãos: Quero comprar, Minha biblioteca, Lendo (vão do meio), Lido, Abandonei
- **Busca** — filtro por título ou autor (acentos ignorados)
- **Avaliação** — quatro categorias (Enredo, Personagens, Edição, Final) em Lendo/Lido
- **Resenha** — texto livre em qualquer status
- **Progresso** — página atual / total e barra de % apenas em Lendo
- **Capa** — upload de imagem (Storage no App; local no demo)
- **CRUD** — criar, editar, trocar status e excluir

---

## Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) LTS (20+)
- npm (vem com o Node)
- Para o **App**: projeto Supabase (gratuito)
- Para o **modo legado**: PostgreSQL local

### Clone e instale

```bash
git clone https://github.com/adryan1-dev/lbook.git
cd lbook
npm install
```

### Scripts úteis

| Comando | O que faz |
| --- | --- |
| `npm run dev:app` | Vite com Supabase (`client/.env` obrigatório) |
| `npm run dev` | Client + Express local (legado) |
| `npm run build -w lbook-client` | Build de produção |
| `npm run dev -w lbook-server` | Só API Express |

### Modo legado (Express + Postgres local)

```bash
cp server/.env.example server/.env
# DATABASE_URL=postgresql://postgres:SENHA@localhost:5432/lbook

npm run dev
```

API em `:3000`, UI em `:5173`. O client usa `api.js` quando Supabase **não** está configurado.

---

## Arquitetura

### App (Supabase + Vercel)

```mermaid
flowchart LR
  User[Usuário] --> UI[React_Vercel]
  UI --> Auth[Supabase_Auth]
  UI --> DB[(Postgres_books)]
  UI --> Storage[Storage_covers]
  Auth --> RLS[RLS_por_user_id]
  RLS --> DB
```

### Demo / Legado

```text
Demo:  Browser → localStorage
Legado: Browser → Vite proxy → Express → PostgreSQL + uploads/
```

### Regras de negócio (resumo)

| Regra | Comportamento |
| --- | --- |
| Status válidos | `biblioteca`, `quero_comprar`, `lendo`, `lido`, `abandonei` |
| Notas | Editáveis em Lendo e Lido; ao sair desses status, valores existentes são preservados |
| Progresso | Só na UI de Lendo |
| Isolamento (App) | RLS: cada conta só vê/edita `books` com `user_id = auth.uid()` |

---

## Estrutura do projeto

```text
lbook/
├── client/                     # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/         # Estante, AuthScreen, modais…
│   │   └── lib/
│   │       ├── store.js        # local | supabase | api
│   │       ├── supabaseStore.js
│   │       ├── auth.jsx
│   │       └── …
│   └── .env.example
├── supabase/
│   ├── migrations/001_books_auth.sql
│   └── README.md
├── vercel.json                 # Deploy do App
├── .github/workflows/          # GitHub Pages (demo)
├── server/                     # Express legado (dev local)
├── CONTEXT.md
└── package.json
```

---

## Glossário

| Termo | Significado |
| --- | --- |
| **Leitura** | Unidade da Estante (card) |
| **Estante** | Tela principal / conjunto de Leituras da conta |
| **Minha biblioteca** | Vão / status “possuo e ainda não li”; o catálogo todo é a Estante |
| **Edição** | Categoria de nota do objeto físico |
| **Média da leitura** | Média das quatro notas (`final_rating`) |

Detalhes: [`CONTEXT.md`](CONTEXT.md).

---

## Troubleshooting

| Sintoma | O que checar |
| --- | --- |
| Tela de login não some após entrar | Supabase Auth; confirme email desligado na v1 |
| “Sessão expirada” | Entre de novo; verifique `VITE_SUPABASE_*` na Vercel |
| Estante vazia para todos | Rode a migration SQL; confira RLS |
| Capa não aparece (App) | Bucket `covers` criado; policies de Storage |
| Demo não persiste entre dispositivos | Esperado — demo usa só o navegador |
| “Backend offline” (legado) | `npm run dev` + `DATABASE_URL` em `server/.env` |

---

## Próximos passos (visão)

- Busca/filtros avançados
- Ranking / favoritos
- Estante compartilhada (casal / grupo)
- Histórico de datas e estatísticas
