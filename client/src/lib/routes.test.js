import { describe, expect, it } from "vitest";
import { parsePath } from "./routes";

describe("parsePath", () => {
  it("treats the Estante as home", () => {
    expect(parsePath("/")).toEqual({ name: "estante" });
    expect(parsePath("")).toEqual({ name: "estante" });
  });

  it("recognizes Mapa and Listas", () => {
    expect(parsePath("/mapa")).toEqual({ name: "mapa" });
    expect(parsePath("/mapa/")).toEqual({ name: "mapa" });
    expect(parsePath("/listas")).toEqual({ name: "listas" });
  });

  it("extracts a public share token", () => {
    expect(parsePath("/s/abc-token")).toEqual({
      name: "share",
      token: "abc-token",
    });
  });

  it("does not treat nested paths as share", () => {
    expect(parsePath("/s/abc/extra")).toEqual({ name: "estante" });
  });
});
