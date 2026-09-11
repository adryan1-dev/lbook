# Contexto do Lbook

Glossário do projeto. Só vocabulário: o que cada termo **é**, e as palavras que deixamos de usar.
Detalhe de implementação e spec não moram aqui.

## App

A versão com conta (Vercel + Supabase): login por email ou **nome de usuário**, Estante na nuvem.
Cada conta tem a própria Estante — ninguém vê nem edita a de outra pessoa.
É a URL que você passa para quem vai usar de verdade (ex.: sua namorada catalogar leituras).

_Avoid_: chamar o App de “demo”, “modo dev” ou “versão local”.

## Conta

Identidade de quem usa o **App**. Uma conta = uma Estante isolada.
Cada conta tem um **nome de usuário** único. Amigos que quiserem usar criam
a própria conta na mesma URL.

_Avoid_: “usuário beta”, “perfil compartilhado”, “login do casal” (estante compartilhada ainda não existe).

## Nome de usuário

Handle único da **Conta**, 3–20 caracteres (`a-z`, `0-9`, `_`). Aparece abaixo de
Estante no header. Dá para entrar com o email **ou** com esse nome.
Contas antigas sem handle passam pela tela “Escolha um nome de usuário” antes da Estante.

_Avoid_: mostrar o email no header no lugar do nome de usuário; tratar o handle como “apelido” ou “nick”.

## Mostrar senha / Ocultar senha

Controle do campo **Senha** (e **Confirmar senha**): o olho revela o texto digitado;
o olho riscado oculta de novo. O rótulo acessível é “Mostrar senha” ou “Ocultar senha”.

_Avoid_: “ver senha”, “toggle”, “eye”, “mostrar/esconder” na UI.

## Desenvolvimento

Ambiente local para construir o Lbook. Com `client/.env` (Supabase), `npm run dev:app` espelha o **App**.
Com `npm run dev` na raiz, sobe client + Express + Postgres local (modo legado, sem login).

_Avoid_: tratar desenvolvimento local como sinônimo do App em produção.

## Leitura

Registro pessoal de uma obra na Estante: título, autor, capa, país de origem,
status de leitura, e — quando o status permitir — quatro notas e uma resenha.
É a unidade da Estante — cada card é uma Leitura, não um livro.
Inclui obras que você quer comprar, já possui, está lendo, já leu ou abandonou.

_Avoid_: Livro (como item da lista), registro, entrada.

## Minha biblioteca

Aba do catálogo completo: todas as Leituras persistidas, com busca por título ou autor.
No formulário, “Minha biblioteca” também é o status padrão ao cadastrar o que você
já possui e ainda não leu.

_Avoid_: tratar a aba Minha biblioteca como só os não lidos; no vazio do catálogo,
chamar a superfície de “sua biblioteca” — o nome da tela continua **Estante**.

## Status de leitura

Posição da Leitura na jornada: Minha biblioteca, Quero comprar, Lendo, Lido ou Abandonei.
Organiza a Estante; não é uma entidade própria.

_Avoid_: categoria (colide com as categorias de nota), tag, prateleira.

## Estante

O conjunto de Leituras e a tela principal do Lbook. Revisitar a Estante é o trabalho primário
da interface; cadastrar é secundário. A home abre em Minha biblioteca.
No **App**, a Estante pertence à conta logada.

_Avoid_: Coleção, Minha coleção, lista.

## Livro

A obra em si — título, autor e capa. São atributos de uma Leitura, não uma entidade própria
na interface.

_Avoid_: usar "livro" para nomear o card, o conjunto, ou o CTA de vazio
(“cadastre o primeiro livro”). A unidade é sempre Leitura.

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

## País de origem

País da obra (publicação / origem cultural), gravado em cada Leitura. Alimenta os pins do **Mapa**. Não é o lugar da compra nem o cenário da história.

_Avoid_: localização, geolocalização, nacionalidade do autor, “onde eu comprei”.

## Mapa

Vista da Estante com um mapa arrastável. Cada pin é um país de origem; várias Leituras no mesmo país compartilham o pin. O balão mostra capa, título, autor e, quando existir, a média da leitura.

_Avoid_: feed mundial, mapa social, “explorar leitores”.

## Já tenho

Lista das Leituras que a conta já possui: Minha biblioteca, Lendo, Lido e Abandonei. Serve para alguém que vai presentear não comprar o que já está na Estante.

_Avoid_: “owned”, “have list”, tratar Já tenho como um status novo.

## Link de lista

Endereço opt-in que mostra só Quero comprar e/ou Já tenho, à escolha de quem gera. Quem abre não precisa de conta. Sem notas e sem resenha. O mesmo endereço continua válido se as listas mudarem; revogar encerra o acesso.

_Avoid_: perfil público, estante compartilhada, feed.
