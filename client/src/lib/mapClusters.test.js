import { describe, expect, it } from "vitest";
import {
  clusterReadingsByCountry,
  firstWithoutCountry,
  readingsWithoutCountry,
} from "./mapClusters";

function reading(overrides) {
  return {
    id: 1,
    title: "Código Limpo",
    author: "Robert C. Martin",
    status: "lido",
    originCountry: "US",
    ratings: { story: 5, characters: 5, edition: 5, final: 5 },
    ...overrides,
  };
}

describe("clusterReadingsByCountry", () => {
  it("groups Leituras that share an origin country and keeps a count", () => {
    const clusters = clusterReadingsByCountry([
      reading({ id: 1, title: "Clean Code", originCountry: "US" }),
      reading({ id: 2, title: "The Pragmatic Programmer", originCountry: "US" }),
      reading({
        id: 3,
        title: "Dom Casmurro",
        author: "Machado de Assis",
        originCountry: "BR",
        status: "quero_comprar",
      }),
    ]);

    expect(clusters).toHaveLength(2);
    const unitedStates = clusters.find((cluster) => cluster.code === "US");
    const brazil = clusters.find((cluster) => cluster.code === "BR");
    expect(unitedStates.readings).toHaveLength(2);
    expect(unitedStates.lat).toBeCloseTo(37.09, 0);
    expect(brazil.readings).toHaveLength(1);
    expect(brazil.name).toBe("Brasil");
  });

  it("drops Leituras without a country and unknown codes", () => {
    const clusters = clusterReadingsByCountry([
      reading({ originCountry: null }),
      reading({ id: 2, originCountry: "ZZ" }),
      reading({ id: 3, originCountry: "JP", title: "Norwegian Wood" }),
    ]);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].code).toBe("JP");
  });

  it("recomputes cluster counts when a status filter is on", () => {
    const readings = [
      reading({ id: 1, originCountry: "JP", status: "lido", title: "1Q84" }),
      reading({
        id: 2,
        originCountry: "JP",
        status: "quero_comprar",
        title: "Kafka à beira-mar",
      }),
      reading({ id: 3, originCountry: "BR", status: "lido", title: "Capitães" }),
    ];

    const lido = clusterReadingsByCountry(readings, "lido");
    expect(lido).toHaveLength(2);
    expect(lido.find((cluster) => cluster.code === "JP").readings).toHaveLength(
      1,
    );

    const wishlist = clusterReadingsByCountry(readings, "quero_comprar");
    expect(wishlist).toHaveLength(1);
    expect(wishlist[0].code).toBe("JP");
    expect(wishlist[0].readings[0].title).toBe("Kafka à beira-mar");
  });
});

describe("readingsWithoutCountry", () => {
  it("lists Leituras that still need a País de origem, newest first", () => {
    const missing = readingsWithoutCountry([
      reading({ id: 3, originCountry: "BR" }),
      reading({ id: 2, originCountry: "", title: "Sem país" }),
      reading({ id: 1, originCountry: null, title: "Também sem" }),
    ]);

    expect(missing.map((item) => item.title)).toEqual([
      "Sem país",
      "Também sem",
    ]);
  });
});

describe("firstWithoutCountry", () => {
  it("picks the most recently added Leitura without a country", () => {
    expect(
      firstWithoutCountry([
        reading({ id: 9, originCountry: "FR" }),
        reading({ id: 8, originCountry: null, title: "Nova" }),
        reading({ id: 2, originCountry: null, title: "Velha" }),
      ]).title,
    ).toBe("Nova");
  });
});
