import { countryByCode, normalizeCountryCode } from "./countries";
import { filterByStatus } from "./readings";

function hasCountry(reading) {
  return Boolean(normalizeCountryCode(reading.originCountry));
}

/** Agrupa Leituras com país de origem; o filtro de status recontabiliza o pin. */
export function clusterReadingsByCountry(readings, statusFilter = "all") {
  const visible = filterByStatus(readings, statusFilter);
  const clusters = new Map();

  for (const reading of visible) {
    const country = countryByCode(reading.originCountry);
    if (!country) {
      continue;
    }

    let cluster = clusters.get(country.code);
    if (!cluster) {
      cluster = {
        code: country.code,
        name: country.name,
        lat: country.lat,
        lng: country.lng,
        readings: [],
      };
      clusters.set(country.code, cluster);
    }
    cluster.readings.push(reading);
  }

  return [...clusters.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "pt"),
  );
}

export function readingsWithoutCountry(readings) {
  return readings.filter((reading) => !hasCountry(reading));
}

/** Mais recentemente adicionada: a lista da Estante vem com id desc. */
export function firstWithoutCountry(readings) {
  return readingsWithoutCountry(readings)[0] ?? null;
}
