export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_PATTERN = /^[a-z0-9_]+$/;
export const PASSWORD_MIN = 6;

export function looksLikeEmail(value) {
  const text = String(value ?? "").trim();
  return text.includes("@") && text.includes(".");
}

export function normalizeUsername(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function parseUsername(value) {
  const username = normalizeUsername(value);
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return {
      ok: false,
      error: `O nome de usuário precisa ter entre ${USERNAME_MIN} e ${USERNAME_MAX} caracteres.`,
    };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: "Use só letras minúsculas, números e underline.",
    };
  }
  if (username.includes("@") || looksLikeEmail(username)) {
    return {
      ok: false,
      error: "O nome de usuário não pode ser um email.",
    };
  }
  return { ok: true, username };
}

export function assertPasswordsMatch(password, confirmation) {
  if (String(password ?? "").length < PASSWORD_MIN) {
    return {
      ok: false,
      error: `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.`,
    };
  }
  if (password !== confirmation) {
    return { ok: false, error: "As senhas não coincidem." };
  }
  return { ok: true };
}

export function loginKind(identifier) {
  const value = String(identifier ?? "").trim();
  if (!value) {
    return { ok: false, error: "Informe email ou nome de usuário." };
  }
  if (looksLikeEmail(value)) {
    return { ok: true, kind: "email", value: value.toLowerCase() };
  }
  const parsed = parseUsername(value);
  if (!parsed.ok) {
    return { ok: false, error: "Email ou nome de usuário inválido." };
  }
  return { ok: true, kind: "username", value: parsed.username };
}
