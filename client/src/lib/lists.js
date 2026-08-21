const OWNED_STATUSES = new Set(["biblioteca", "lendo", "lido", "abandonei"]);

export function splitHaveAndWishlist(readings) {
  const queroComprar = [];
  const jaTenho = [];

  for (const reading of readings) {
    if (reading.status === "quero_comprar") {
      queroComprar.push(reading);
    } else if (OWNED_STATUSES.has(reading.status)) {
      jaTenho.push(reading);
    }
  }

  return { queroComprar, jaTenho };
}

export function formatListCopy(readings) {
  return readings
    .map((reading) => `${reading.title} — ${reading.author}`)
    .join("\n");
}

export function readingsForShare(
  readings,
  { includeQueroComprar, includeOwned },
) {
  const { queroComprar, jaTenho } = splitHaveAndWishlist(readings);
  return {
    queroComprar: includeQueroComprar ? queroComprar : [],
    jaTenho: includeOwned ? jaTenho : [],
  };
}

export function sharePath(token) {
  return `/s/${token}`;
}

export function shareUrl(origin, token) {
  return `${origin}${sharePath(token)}`;
}
