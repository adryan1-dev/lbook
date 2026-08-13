# Contexto do Lbook

Glossário do projeto. Só vocabulário: o que cada termo **é**, e as palavras que deixamos de usar.
Detalhe de implementação e spec não moram aqui.

## Leitura

Registro pessoal de uma obra lida ou em leitura: título, autor, capa, quatro notas e uma resenha.
É a unidade da Estante — cada card é uma Leitura, não um livro.

_Avoid_: Livro (como item da lista), registro, entrada.

## Estante

O conjunto de Leituras e a tela principal do Lbook. Revisitar a Estante é o trabalho primário
da interface; cadastrar é secundário.

_Avoid_: Coleção, Minha coleção, biblioteca, lista.

## Livro

A obra em si — título, autor e capa. São atributos de uma Leitura, não uma entidade própria
na interface.

_Avoid_: usar "livro" para nomear o card ou o conjunto.

## Edição

Categoria de nota sobre a qualidade do objeto físico: papel, impressão, acabamento, capa.
Não se refere ao ato de editar um registro.

_Avoid_: "A leitura flui bem?" como descrição de Edição.

## Enredo, Personagens, Final

As outras três categorias de nota de uma Leitura. Enredo é a trama; Personagens é o elenco;
Final é o encerramento. Junto com Edição, formam a média da Leitura.

_Avoid_: "nota geral" como sinônimo de qualquer categoria isolada.

## Média da leitura

A média aritmética das quatro categorias, com uma casa decimal. Persistida como `final_rating`.

_Avoid_: nota final (colide com a categoria Final).
