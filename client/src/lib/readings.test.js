import { describe, expect, it } from "vitest";
import { SHELF_BAYS, countByStatus, readingsInBay } from "./readings";

describe("SHELF_BAYS", () => {
  it("puts Lendo in the middle bay, at hand height", () => {
    expect(SHELF_BAYS.map((bay) => bay.value)).toEqual([
      "quero_comprar",
      "biblioteca",
      "lendo",
      "lido",
      "abandonei",
    ]);
    expect(SHELF_BAYS[2].featured).toBe(true);
  });
});

describe("readingsInBay", () => {
  const readings = [
    { id: 1, status: "lendo" },
    { id: 2, status: "lido" },
    { id: 3, status: "lendo" },
  ];

  it("keeps only the readings that sit in that bay", () => {
    expect(readingsInBay(readings, "lendo").map((item) => item.id)).toEqual([
      1, 3,
    ]);
    expect(readingsInBay(readings, "quero_comprar")).toEqual([]);
  });
});

describe("countByStatus", () => {
  it("counts the whole Estante plus each bay", () => {
    const counts = countByStatus([
      { status: "lendo" },
      { status: "lendo" },
      { status: "lido" },
    ]);
    expect(counts.all).toBe(3);
    expect(counts.lendo).toBe(2);
    expect(counts.lido).toBe(1);
    expect(counts.biblioteca).toBe(0);
  });
});
