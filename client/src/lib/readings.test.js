import { describe, expect, it } from "vitest";
import { countByStatus, filterByStatus } from "./readings";

function reading(overrides) {
  return {
    id: 1,
    title: "Código Limpo",
    author: "Robert C. Martin",
    status: "biblioteca",
    ...overrides,
  };
}

describe("filterByStatus", () => {
  const readings = [
    reading({ id: 1, status: "quero_comprar", title: "Wishlist" }),
    reading({ id: 2, status: "biblioteca", title: "Na estante" }),
    reading({ id: 3, status: "lendo", title: "Lendo agora" }),
    reading({ id: 4, status: "lido", title: "Já li" }),
  ];

  it("keeps Quero comprar out of Minha biblioteca", () => {
    expect(filterByStatus(readings, "all").map((item) => item.title)).toEqual([
      "Na estante",
      "Lendo agora",
      "Já li",
    ]);
  });

  it("lists only Quero comprar on that tab", () => {
    expect(
      filterByStatus(readings, "quero_comprar").map((item) => item.title),
    ).toEqual(["Wishlist"]);
  });
});

describe("countByStatus", () => {
  it("counts Minha biblioteca without Quero comprar", () => {
    const counts = countByStatus([
      reading({ id: 1, status: "quero_comprar" }),
      reading({ id: 2, status: "quero_comprar" }),
      reading({ id: 3, status: "biblioteca" }),
      reading({ id: 4, status: "lido" }),
    ]);

    expect(counts.all).toBe(2);
    expect(counts.quero_comprar).toBe(2);
    expect(counts.biblioteca).toBe(1);
    expect(counts.lido).toBe(1);
  });
});
