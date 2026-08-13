export const RATING_CATEGORIES = [
  {
    key: "story",
    label: "Enredo",
    hint: "A trama prende do começo ao fim?",
  },
  {
    key: "characters",
    label: "Personagens",
    hint: "Os personagens são marcantes?",
  },
  {
    key: "edition",
    label: "Edição",
    hint: "Papel, impressão e acabamento: o objeto é bem-feito?",
  },
  {
    key: "final",
    label: "Final",
    hint: "O encerramento fecha bem a história?",
  },
];

export const emptyRatings = {
  story: 0,
  characters: 0,
  edition: 0,
  final: 0,
};

/** Média das quatro categorias, ou null enquanto alguma estiver sem nota. */
export function averageOf(ratings) {
  const values = RATING_CATEGORIES.map((category) => {
    return Number(ratings[category.key]) || 0;
  });

  if (values.some((value) => value <= 0)) {
    return null;
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return (sum / values.length).toFixed(1);
}

/** A persistência fala `books`; a interface fala Leitura. Ver docs/adr/0001. */
export function toReading(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.image_url || null,
    review: book.review || "",
    ratings: {
      story: book.story || 0,
      characters: book.characters || 0,
      edition: book.edition || 0,
      final: book.final || 0,
    },
  };
}
