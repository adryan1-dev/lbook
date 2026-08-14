import { toReading } from "./readings";

const GENERIC_ERROR = "Não foi possível falar com o servidor.";
const OFFLINE_ERROR =
  "Backend offline. Confira se o server subiu no `npm run dev` e se `server/.env` tem DATABASE_URL.";

async function request(path, options) {
  let response;

  try {
    response = await fetch(path, options);
  } catch {
    throw new Error(OFFLINE_ERROR);
  }

  if (!response.ok) {
    let message = GENERIC_ERROR;
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // Proxy do Vite devolve 5xx vazio quando o Express não está escutando.
      if (response.status >= 500) {
        message = OFFLINE_ERROR;
      }
    }
    throw new Error(message);
  }

  return response;
}

export async function listReadings() {
  const response = await request("/api/books");
  const books = await response.json();
  return books.map(toReading);
}

export async function createReading(payload) {
  const response = await request("/api/books", {
    method: "POST",
    body: payload,
  });
  return toReading(await response.json());
}

export async function updateReading(id, payload) {
  const response = await request(`/api/books/${id}`, {
    method: "PUT",
    body: payload,
  });
  return toReading(await response.json());
}

export async function deleteReading(id) {
  await request(`/api/books/${id}`, { method: "DELETE" });
}
