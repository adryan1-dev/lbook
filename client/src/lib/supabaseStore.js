import { supabase } from "./supabase";
import { toReading } from "./readings";

const ALLOWED_STATUSES = [
  "quero_comprar",
  "biblioteca",
  "lendo",
  "lido",
  "abandonei",
];
const STATUSES_WITH_RATINGS = new Set(["lido", "lendo"]);
const GENERIC_ERROR = "Não foi possível salvar. Tente de novo.";

function parseStatus(raw) {
  if (!ALLOWED_STATUSES.includes(raw)) {
    return null;
  }
  return raw;
}

function averageRating(story, characters, edition, finalValue) {
  return (
    (Number(story) + Number(characters) + Number(edition) + Number(finalValue)) /
    4
  ).toFixed(1);
}

function ratingsForWrite(status, fields, existing) {
  if (STATUSES_WITH_RATINGS.has(status)) {
    return {
      story: Number(fields.story) || 0,
      characters: Number(fields.characters) || 0,
      edition: Number(fields.edition) || 0,
      final: Number(fields.final) || 0,
    };
  }

  if (existing) {
    return {
      story: Number(existing.story) || 0,
      characters: Number(existing.characters) || 0,
      edition: Number(existing.edition) || 0,
      final: Number(existing.final_score) || 0,
    };
  }

  return { story: 0, characters: 0, edition: 0, final: 0 };
}

function parsePageCount(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

function pagesForWrite(fields, existing) {
  const hasCurrent =
    fields.current_page !== undefined && fields.current_page !== "";
  const hasTotal = fields.total_pages !== undefined && fields.total_pages !== "";

  let currentPage = hasCurrent
    ? parsePageCount(fields.current_page)
    : existing
      ? Number(existing.current_page) || 0
      : 0;
  let totalPages = hasTotal
    ? parsePageCount(fields.total_pages)
    : existing
      ? Number(existing.total_pages) || 0
      : 0;

  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = totalPages;
  }

  return { currentPage, totalPages };
}

function formDataToFields(formData) {
  const fields = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "image") {
      fields[key] = value;
    }
  }
  return {
    fields,
    cover: formData.get("image") instanceof File ? formData.get("image") : null,
  };
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Sessão expirada. Entre de novo.");
  }

  return user;
}

async function uploadCover(file, userId) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${userId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from("covers").upload(path, file, {
    upsert: false,
    contentType: file.type || "image/jpeg",
  });

  if (error) {
    throw new Error("Erro ao enviar a capa.");
  }

  const { data } = supabase.storage.from("covers").getPublicUrl(path);
  return data.publicUrl;
}

function mapDbError(error) {
  if (!error) {
    return GENERIC_ERROR;
  }
  if (error.message?.includes("JWT")) {
    return "Sessão expirada. Entre de novo.";
  }
  return error.message || GENERIC_ERROR;
}

export async function listReadings() {
  const { data, error } = await supabase
    .from("books")
    .select(
      "id, title, author, image_url, story, characters, edition, final_score, review, final_rating, status, current_page, total_pages, created_at",
    )
    .order("id", { ascending: false });

  if (error) {
    throw new Error(mapDbError(error));
  }

  return (data ?? []).map((book) =>
    toReading({ ...book, final: book.final_score }),
  );
}

export async function createReading(formData) {
  const user = await requireUser();
  const { fields, cover } = formDataToFields(formData);

  const status = parseStatus(fields.status);
  if (!status) {
    throw new Error(
      "Status inválido. Use quero_comprar, biblioteca, lendo, lido ou abandonei.",
    );
  }

  const ratings = ratingsForWrite(status, fields, null);
  const pages = pagesForWrite(fields, null);
  const finalRating = averageRating(
    ratings.story,
    ratings.characters,
    ratings.edition,
    ratings.final,
  );

  let imageUrl = null;
  if (cover) {
    imageUrl = await uploadCover(cover, user.id);
  }

  const { data, error } = await supabase
    .from("books")
    .insert({
      user_id: user.id,
      title: fields.title,
      author: fields.author,
      image_url: imageUrl,
      story: ratings.story,
      characters: ratings.characters,
      edition: ratings.edition,
      final_score: ratings.final,
      review: fields.review || "",
      final_rating: finalRating,
      status,
      current_page: pages.currentPage,
      total_pages: pages.totalPages,
    })
    .select()
    .single();

  if (error) {
    throw new Error(mapDbError(error));
  }

  return toReading({ ...data, final: data.final_score });
}

export async function updateReading(id, formData) {
  const user = await requireUser();
  const { fields, cover } = formDataToFields(formData);

  const status = parseStatus(fields.status);
  if (!status) {
    throw new Error(
      "Status inválido. Use quero_comprar, biblioteca, lendo, lido ou abandonei.",
    );
  }

  const { data: existing, error: fetchError } = await supabase
    .from("books")
    .select(
      "story, characters, edition, final_score, current_page, total_pages, image_url",
    )
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    throw new Error("Leitura não encontrada.");
  }

  const ratings = ratingsForWrite(status, fields, existing);
  const pages = pagesForWrite(fields, existing);
  const finalRating = averageRating(
    ratings.story,
    ratings.characters,
    ratings.edition,
    ratings.final,
  );

  let imageUrl = existing.image_url;
  if (cover) {
    imageUrl = await uploadCover(cover, user.id);
  }

  const { data, error } = await supabase
    .from("books")
    .update({
      title: fields.title,
      author: fields.author,
      story: ratings.story,
      characters: ratings.characters,
      edition: ratings.edition,
      final_score: ratings.final,
      review: fields.review || "",
      final_rating: finalRating,
      status,
      current_page: pages.currentPage,
      total_pages: pages.totalPages,
      image_url: imageUrl,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(mapDbError(error));
  }

  return toReading({ ...data, final: data.final_score });
}

export async function deleteReading(id) {
  await requireUser();

  const { error } = await supabase.from("books").delete().eq("id", id);

  if (error) {
    throw new Error(mapDbError(error));
  }
}
