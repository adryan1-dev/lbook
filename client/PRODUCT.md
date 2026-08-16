# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Adryan and people he invites (partner, friends). Each account keeps a private Estante. The job is cataloging what they own, want to buy, are reading, have read, or abandoned — then reopening that shelf to rate, review, and track progress.

Secondary: recruiters evaluating Lbook as a portfolio piece. They are not Estante users; they judge craft, product thinking, and a working app. Attention is earned by the real notebook, never by invented traction, community, or social proof.

## Product Purpose

Lbook is a personal reading notebook. It lets someone catalog readings, organize them by status, rate them, write reviews, and track progress on one Estante.

Success for the owner: the shelf stays accurate and easy to reopen. Success for the portfolio: a recruiter can create an account and use the real App.

## Positioning

The unit is a Leitura, not a book listing. It covers the whole journey: quero comprar, owned-unread (Minha biblioteca), lendo, lido, and abandonei. Ratings include Edição — the physical object (paper, print, binding, cover) — alongside plot, characters, and ending. It is a private notebook, not a social network and not an ISBN catalog.

## Operating Context

- App (Vercel + Supabase): signed-in Estante in the cloud; one account = one shelf; RLS isolation. This is the only public product surface.
- Legacy local (Express + PostgreSQL, no login) is a development leftover, not a product surface.
- Copy and UI are Brazilian Portuguese.
- Reopening the Estante is the primary task; adding a Leitura is secondary.
- Shared shelf (couple/group) is a stated future idea, not shipped.

## Capabilities and Constraints

Shipped: account with unique username; sign-in with email or username; statuses (Minha biblioteca, Quero comprar, Lendo, Lido, Abandonei); search by title/author; four rating categories on Lendo/Lido; free-text review; page progress only while Lendo; cover upload; full CRUD.

Not shipped: shared Estante, advanced filters, ranking/favorites, reading history/stats. Do not design or copy as if they exist.

Terminology is product law, not style: Leitura is the list item (never “livro”), Estante is the home surface, Minha biblioteca is both the full-catalog tab and the default owned-unread status, Edição is physical-object quality (not the edit action), Média da leitura is the four-category average (not “nota final”).

## Brand Commitments

- Name: Lbook
- Glossary in CONTEXT.md is binding.
- Voice: Brazilian Portuguese, direct, product-specific. The wordmark is “Lbook”; the screen title is “Estante”.
- One account = one private Estante. No feed, no invented social proof, no shared shelf in the UI.
- Interface remains Brazilian Portuguese for now.

## Evidence on Hand

- App: https://lbook-woad.vercel.app
- Glossary: CONTEXT.md (repo root)
- Product description: README.md
- No testimonials, user counts, press, or case studies exist — do not invent them

## Product Principles

1. The Estante is the product; adding a Leitura serves it, not the other way around.
2. A Leitura is a personal journey, not a catalog record — status, notes, and the physical edition belong together.
3. Privacy is the default: nobody sees another person's shelf.
4. Speak the product's words. If a label could belong to any reading app, it is wrong.
5. Recruiter attention is earned by a real, usable notebook — never by fake scale or social features.
