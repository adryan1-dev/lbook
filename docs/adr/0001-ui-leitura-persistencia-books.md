# 0001 — A UI fala Leitura/Estante; a persistência continua books

## Contexto

A interface e o banco discordavam: `App.jsx` alternava entre "livro" e "leitura" no mesmo
texto, enquanto a tabela e a API expõem `books` e `/api/books`. O ciclo de redesenho é
só de interface, sem migração de banco.

## Decisão

A camada de apresentação adota Leitura como unidade e Estante como conjunto. A tabela
`books`, as colunas (`story`, `characters`, `edition`, `final_score`, `final_rating`) e as
rotas `/api/books` permanecem inalteradas neste ciclo. A tradução acontece na borda do
cliente.

## Motivo

Renomear a persistência exigiria migração, alteração das rotas e reescrita do servidor —
fora do escopo acordado. Manter os dois vocabulários sem registrar a fronteira faria o
próximo leitor tratar a divergência como bug: quem inspecionar o network verá `books` numa
tela que só diz Leitura.
