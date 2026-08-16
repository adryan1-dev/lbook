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

export const READING_STATUSES = [
  { value: "biblioteca", label: "Minha biblioteca" },
  { value: "quero_comprar", label: "Quero comprar" },
  { value: "lendo", label: "Lendo" },
  { value: "lido", label: "Lido" },
  { value: "abandonei", label: "Abandonei" },
];

/** Ordem espacial da Estante. Lendo fica no vão do meio, à altura da mão. */
export const SHELF_BAYS = [
  {
    value: "quero_comprar",
    label: "Quero comprar",
    hint: "Ainda não está em casa",
  },
  {
    value: "biblioteca",
    label: "Minha biblioteca",
    hint: "Em casa, ainda não li",
  },
  {
    value: "lendo",
    label: "Lendo",
    hint: "Na mão",
    featured: true,
  },
  {
    value: "lido",
    label: "Lido",
    hint: "Já passou por aqui",
  },
  {
    value: "abandonei",
    label: "Abandonei",
    hint: "Ficou pelo caminho",
  },
];

export const DEFAULT_STATUS = "biblioteca";

export const emptyRatings = {
  story: 0,
  characters: 0,
  edition: 0,
  final: 0,
};

export function statusAllowsRatings(status) {
  return status === "lido" || status === "lendo";
}

export function statusShowsProgress(status) {
  return status === "lendo";
}

export function labelOfStatus(status) {
  return (
    READING_STATUSES.find((item) => item.value === status)?.label ?? status
  );
}

/** Percentual 0–100, ou null se não houver total de páginas. */
export function progressPercent(currentPage, totalPages) {
  const total = Number(totalPages) || 0;
  if (total <= 0) {
    return null;
  }
  const current = Math.max(0, Number(currentPage) || 0);
  return Math.min(100, Math.round((current / total) * 100));
}

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

/** Contagens por status a partir da Estante completa. */
export function countByStatus(readings) {
  const counts = {
    all: readings.length,
    quero_comprar: 0,
    biblioteca: 0,
    lendo: 0,
    lido: 0,
    abandonei: 0,
  };

  for (const reading of readings) {
    if (counts[reading.status] !== undefined) {
      counts[reading.status] += 1;
    }
  }

  return counts;
}

export function readingsInBay(readings, status) {
  return readings.filter((reading) => reading.status === status);
}

function normalizeSearch(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

/** Filtra por título ou autor (acentos ignorados). */
export function filterBySearch(readings, query) {
  const needle = normalizeSearch(query);
  if (!needle) {
    return readings;
  }

  return readings.filter((reading) => {
    const title = normalizeSearch(reading.title);
    const author = normalizeSearch(reading.author);
    return title.includes(needle) || author.includes(needle);
  });
}

/** A persistência fala `books`; a interface fala Leitura. Ver docs/adr/0001. */
export function toReading(book) {
  let status = book.status || "lido";
  if (status === "para_ler") {
    status = "biblioteca";
  }

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.image_url || null,
    review: book.review || "",
    status,
    currentPage: Number(book.current_page) || 0,
    totalPages: Number(book.total_pages) || 0,
    ratings: {
      story: book.story || 0,
      characters: book.characters || 0,
      edition: book.edition || 0,
      final: book.final ?? book.final_score ?? 0,
    },
  };
}
