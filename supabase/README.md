# Supabase setup (Lbook App)

Rode o SQL em [`migrations/001_books_auth.sql`](migrations/001_books_auth.sql) no **SQL Editor** do dashboard Supabase.

## Auth (Dashboard)

1. **Authentication → Providers → Email** — habilitado
2. **Authentication → Sign In / Providers → Confirm email** — desligado na v1 (entrada imediata)
3. **Authentication → URL Configuration** — Site URL = URL da Vercel (ex.: `https://lbook.vercel.app`)

## Variáveis (Vercel e local)

Copie `client/.env.example` para `client/.env` e preencha:

- `VITE_SUPABASE_URL` — Settings → API → Project URL
- `VITE_SUPABASE_ANON_KEY` — Settings → API → anon / publishable key

Nunca coloque a `service_role` no frontend.

## Contas

Cada pessoa cria a própria conta na URL do app. RLS garante que só vê e edita a própria estante.
