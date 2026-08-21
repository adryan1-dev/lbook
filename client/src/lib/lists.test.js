import { describe, expect, it } from "vitest";
import {
  formatListCopy,
  readingsForShare,
  sharePath,
  splitHaveAndWishlist,
} from "./lists";

function reading(overrides) {
  return {
    id: 1,
    title: "Código Limpo",
    author: "Robert C. Martin",
    status: "biblioteca",
    ...overrides,
  };
}

describe("splitHaveAndWishlist", () => {
  it("puts quero_comprar on the wishlist and every other status on Já tenho", () => {
    const split = splitHaveAndWishlist([
      reading({ id: 1, status: "quero_comprar", title: "Quero" }),
      reading({ id: 2, status: "biblioteca", title: "Na estante" }),
      reading({ id: 3, status: "lendo", title: "Lendo agora" }),
      reading({ id: 4, status: "lido", title: "Já li" }),
      reading({ id: 5, status: "abandonei", title: "Parei" }),
    ]);

    expect(split.queroComprar.map((item) => item.title)).toEqual(["Quero"]);
    expect(split.jaTenho.map((item) => item.title)).toEqual([
      "Na estante",
      "Lendo agora",
      "Já li",
      "Parei",
    ]);
  });
});

describe("formatListCopy", () => {
  it("formats title — author lines for WhatsApp", () => {
    expect(
      formatListCopy([
        reading({ title: "Código Limpo", author: "Robert C. Martin" }),
        reading({ title: "Dom Casmurro", author: "Machado de Assis" }),
      ]),
    ).toBe("Código Limpo — Robert C. Martin\nDom Casmurro — Machado de Assis");
  });

  it("returns an empty string when the section has no Leituras", () => {
    expect(formatListCopy([])).toBe("");
  });
});

describe("readingsForShare", () => {
  it("respects include flags without rotating the token idea", () => {
    const readings = [
      reading({ id: 1, status: "quero_comprar", title: "Wishlist" }),
      reading({ id: 2, status: "lido", title: "Owned" }),
    ];

    expect(
      readingsForShare(readings, {
        includeQueroComprar: true,
        includeOwned: false,
      }).queroComprar,
    ).toHaveLength(1);
    expect(
      readingsForShare(readings, {
        includeQueroComprar: true,
        includeOwned: false,
      }).jaTenho,
    ).toHaveLength(0);

    const both = readingsForShare(readings, {
      includeQueroComprar: true,
      includeOwned: true,
    });
    expect(both.queroComprar).toHaveLength(1);
    expect(both.jaTenho).toHaveLength(1);
  });
});

describe("sharePath", () => {
  it("builds the public path from the token", () => {
    expect(sharePath("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(
      "/s/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    );
  });
});
