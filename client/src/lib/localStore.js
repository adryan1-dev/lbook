import { statusAllowsRatings } from "./readings";

const STORAGE_KEY = "lbook.readings";
const ALLOWED_STATUSES = [
  "quero_comprar",
  "biblioteca",
  "lendo",
  "lido",
  "abandonei",
];
const INVALID_STATUS =
  "Status inválido. Use quero_comprar, biblioteca, lendo, lido ou abandonei.";
const QUOTA_ERROR =
  "A estante está cheia neste navegador. Remova uma leitura ou use uma capa menor.";
const COVER_MAX_WIDTH = 600;
const COVER_JPEG_QUALITY = 0.7;

const SEED_READINGS = [
  {
    id: 5,
    title: "Klara e o Sol",
    author: "Kazuo Ishiguro",
    coverUrl: null,
    review: "",
    status: "quero_comprar",
    currentPage: 0,
    totalPages: 0,
    ratings: { story: 0, characters: 0, edition: 0, final: 0 },
  },
  {
    id: 4,
    title: "Cem anos de solidão",
    author: "Gabriel García Márquez",
    coverUrl: null,
    review: "",
    status: "biblioteca",
    currentPage: 0,
    totalPages: 0,
    ratings: { story: 0, characters: 0, edition: 0, final: 0 },
  },
  {
    id: 3,
    title: "Duna",
    author: "Frank Herbert",
    coverUrl: null,
    review:
      "Ainda no deserto de Arrakis — a política das Casas está começando a engrenar.",
    status: "lendo",
    currentPage: 186,
    totalPages: 688,
    ratings: { story: 4, characters: 5, edition: 4, final: 0 },
  },
  {
    id: 2,
    title: "O Hobbit",
    author: "J. R. R. Tolkien",
    coverUrl: null,
    review:
      "Aventura quentinha, ritmo de conto. A edição de capa dura vale o espaço na estante.",
    status: "lido",
    currentPage: 0,
    totalPages: 0,
    ratings: { story: 5, characters: 5, edition: 4, final: 4 },
  },
  {
    id: 1,
    title: "Ulisses",
    author: "James Joyce",
    coverUrl: null,
    review: "Parei no episódio 6. Volto outro dia — ou não.",
    status: "abandonei",
    currentPage: 0,
    totalPages: 0,
    ratings: { story: 3, characters: 4, edition: 3, final: 0 },
  },
];

function cloneSeed() {
  return SEED_READINGS.map((reading) => ({
    ...reading,
    ratings: { ...reading.ratings },
  }));
}

function parseStatus(raw) {
  if (!ALLOWED_STATUSES.includes(raw)) {
    return null;
  }
  return raw;
}

function parsePageCount(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

function ratingsForWrite(status, body, existing) {
  if (statusAllowsRatings(status)) {
    return {
      story: Number(body.story) || 0,
      characters: Number(body.characters) || 0,
      edition: Number(body.edition) || 0,
      final: Number(body.final) || 0,
    };
  }

  if (existing) {
    return { ...existing.ratings };
  }

  return { story: 0, characters: 0, edition: 0, final: 0 };
}

function pagesForWrite(body, existing) {
  const hasCurrent = body.current_page !== undefined && body.current_page !== "";
  const hasTotal = body.total_pages !== undefined && body.total_pages !== "";

  let currentPage = hasCurrent
    ? parsePageCount(body.current_page)
    : existing
      ? Number(existing.currentPage) || 0
      : 0;
  let totalPages = hasTotal
    ? parsePageCount(body.total_pages)
    : existing
      ? Number(existing.totalPages) || 0
      : 0;

  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = totalPages;
  }

  return { currentPage, totalPages };
}

function bodyFromFormData(formData) {
  return {
    title: String(formData.get("title") || "").trim(),
    author: String(formData.get("author") || "").trim(),
    review: String(formData.get("review") || ""),
    status: formData.get("status"),
    story: formData.get("story"),
    characters: formData.get("characters"),
    edition: formData.get("edition"),
    final: formData.get("final"),
    current_page: formData.get("current_page"),
    total_pages: formData.get("total_pages"),
    image: formData.get("image"),
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível ler a capa."));
    image.src = src;
  });
}

async function coverFileToDataUrl(file) {
  if (!(file instanceof Blob) || file.size === 0) {
    return null;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const scale = image.width > COVER_MAX_WIDTH ? COVER_MAX_WIDTH / image.width : 1;
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", COVER_JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    const seed = cloneSeed();
    persist(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("invalid");
    }
    return parsed;
  } catch {
    const seed = cloneSeed();
    persist(seed);
    return seed;
  }
}

function persist(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error(QUOTA_ERROR);
    }
    throw new Error("Não foi possível guardar a estante neste navegador.");
  }
}

function nextId(records) {
  return records.reduce((max, reading) => Math.max(max, Number(reading.id) || 0), 0) + 1;
}

function byIdDesc(records) {
  return [...records].sort((a, b) => b.id - a.id);
}

export async function listReadings() {
  return byIdDesc(loadRecords());
}

export async function createReading(payload) {
  const body = bodyFromFormData(payload);
  const status = parseStatus(body.status);
  if (!status) {
    throw new Error(INVALID_STATUS);
  }

  const records = loadRecords();
  const coverUrl = await coverFileToDataUrl(body.image);
  const created = {
    id: nextId(records),
    title: body.title,
    author: body.author,
    coverUrl,
    review: body.review || "",
    status,
    ...pagesForWrite(body, null),
    ratings: ratingsForWrite(status, body, null),
  };

  records.push(created);
  persist(records);
  return created;
}

export async function updateReading(id, payload) {
  const body = bodyFromFormData(payload);
  const status = parseStatus(body.status);
  if (!status) {
    throw new Error(INVALID_STATUS);
  }

  const records = loadRecords();
  const index = records.findIndex((reading) => String(reading.id) === String(id));
  if (index < 0) {
    throw new Error("Leitura não encontrada.");
  }

  const existing = records[index];
  const coverUrl = await coverFileToDataUrl(body.image);
  const updated = {
    ...existing,
    title: body.title,
    author: body.author,
    review: body.review || "",
    status,
    coverUrl: coverUrl ?? existing.coverUrl,
    ...pagesForWrite(body, existing),
    ratings: ratingsForWrite(status, body, existing),
  };

  records[index] = updated;
  persist(records);
  return updated;
}

export async function deleteReading(id) {
  const records = loadRecords();
  const next = records.filter((reading) => String(reading.id) !== String(id));
  persist(next);
}
