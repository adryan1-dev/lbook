import { describe, expect, it } from "vitest";
import {
  assertPasswordsMatch,
  loginKind,
  looksLikeEmail,
  parseUsername,
} from "./identity";

describe("parseUsername", () => {
  it("accepts a unique-style handle", () => {
    expect(parseUsername("  Ada_01 ")).toEqual({
      ok: true,
      username: "ada_01",
    });
  });

  it("rejects short, long, or email-like values", () => {
    expect(parseUsername("ab").ok).toBe(false);
    expect(parseUsername("a".repeat(21)).ok).toBe(false);
    expect(parseUsername("Ada Silva").ok).toBe(false);
    expect(parseUsername("ada@lbook.com").ok).toBe(false);
  });
});

describe("assertPasswordsMatch", () => {
  it("requires the same password twice", () => {
    expect(assertPasswordsMatch("secret1", "secret1").ok).toBe(true);
    expect(assertPasswordsMatch("secret1", "secret2").error).toBe(
      "As senhas não coincidem.",
    );
    expect(assertPasswordsMatch("123", "123").ok).toBe(false);
  });
});

describe("loginKind", () => {
  it("treats an email as email login", () => {
    expect(loginKind("Ada@Lbook.com")).toEqual({
      ok: true,
      kind: "email",
      value: "ada@lbook.com",
    });
  });

  it("treats a handle as username login", () => {
    expect(loginKind("Ada_01")).toEqual({
      ok: true,
      kind: "username",
      value: "ada_01",
    });
  });

  it("does not distinguish empty from invalid with a leaky message", () => {
    expect(looksLikeEmail("ada_01")).toBe(false);
    expect(loginKind("").ok).toBe(false);
  });
});
