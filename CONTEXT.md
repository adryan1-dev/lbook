# Contexto do Lbook

Glossário do projeto. Só vocabulário: o que cada termo **é**, e as palavras que deixamos de usar.
Detalhe de implementação e spec não moram aqui.

## Demo

A versão pública do Lbook (GitHub Pages): mesma Estante e mesma interface, sem login.
Cada visitante mantém a própria Estante no navegador — os dados não são compartilhados entre pessoas.
Na primeira visita, o app pode mostrar leituras de exemplo para explorar o produto.

_Avoid_: chamar o demo de “versão beta”, “staging” ou “produção full stack”.

## Desenvolvimento

O modo local com `npm run dev`: client + API + PostgreSQL. É onde a persistência
server-side e futuras features (login, estante por usuário) são construídas.
Não é a URL pública do portfólio.

_Avoid_: tratar `npm run dev` como sinônimo do demo público.

## Leitura

Registro pessoal de uma obra na Estante: título, autor, capa, status de leitura,
e — quando o status permitir — quatro notas e uma resenha.
É a unidade da Estante — cada card é uma Leitura, não um livro.
Inclui obras que você quer comprar, já possui, está lendo, já leu ou abandonou.

_Avoid_: Livro (como item da lista), registro, entrada.

## Minha biblioteca

Aba do catálogo completo: todas as Leituras persistidas, com busca por título ou autor.
No formulário, “Minha biblioteca” também é o status padrão ao cadastrar o que você
já possui e ainda não leu.

_Avoid_: tratar a aba Minha biblioteca como só os não lidos.

## Status de leitura

Posição da Leitura na jornada: Minha biblioteca, Quero comprar, Lendo, Lido ou Abandonei.
Organiza a Estante; não é uma entidade própria.

_Avoid_: categoria (colide com as categorias de nota), tag, prateleira.

## Estante

O conjunto de Leituras e a tela principal do Lbook. Revisitar a Estante é o trabalho primário
da interface; cadastrar é secundário. A home abre em Minha biblioteca.

_Avoid_: Coleção, Minha coleção, lista.

## Livro

A obra em si — título, autor e capa. São atributos de uma Leitura, não uma entidade própria
na interface.

_Avoid_: usar "livro" para nomear o card ou o conjunto.

## Progresso

Página atual e total de páginas de uma Leitura em Lendo. A barra mostra
`página atual / total` como percentual.

_Avoid_: percentual solto sem páginas; progresso fora do status Lendo.

## Edição

Categoria de nota sobre a qualidade do objeto físico: papel, impressão, acabamento, capa.
Não se refere ao ato de editar um registro.

_Avoid_: "A leitura flui bem?" como descrição de Edição.

## Enredo, Personagens, Final

As outras três categorias de nota de uma Leitura. Enredo é a trama; Personagens é o elenco;
Final é o encerramento. Junto com Edição, formam a média da Leitura.
Notas só se aplicam quando o status é Lendo ou Lido.

_Avoid_: "nota geral" como sinônimo de qualquer categoria isolada.

## Média da leitura

A média aritmética das quatro categorias, com uma casa decimal. Persistida como `final_rating`.

_Avoid_: nota final (colide com a categoria Final).

## Dados só neste navegador

Aviso discreto no header do **Demo**: deixa claro que a Estante vive apenas
no navegador daquele visitante. Não aparece no modo Desenvolvimento.

_Avoid_: “modo offline”, “sem servidor” como título; “localStorage” na UI.
