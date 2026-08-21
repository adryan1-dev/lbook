import { useEffect, useState } from "react";
import {
  formatListCopy,
  shareUrl,
  splitHaveAndWishlist,
} from "../lib/lists";
import { usesSupabase } from "../lib/store";
import { countryName } from "../lib/countries";
import { Copy, Link, LinkOff, Printer } from "./icons";

function ListSection({ title, readings, onCopy, copied }) {
  return (
    <section className="rounded-3xl border border-mist-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          {title}
          <span className="ml-2 text-sm font-medium tabular-nums text-ink-500">
            {readings.length}
          </span>
        </h2>
        <button
          type="button"
          onClick={() => onCopy(readings, title)}
          disabled={readings.length === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-mist-200 px-3 py-1.5 text-sm font-semibold text-ink-700 hover:bg-mist-100 disabled:opacity-40"
        >
          <Copy className="size-4" />
          {copied === title ? "Copiado" : "Copiar"}
        </button>
      </div>

      {readings.length === 0 ? (
        <p className="mt-4 text-sm text-ink-500">Nenhuma leitura nesta lista.</p>
      ) : (
        <ul className="mt-4 divide-y divide-mist-100">
          {readings.map((reading) => (
            <li key={reading.id} className="flex gap-3 py-3">
              {reading.coverUrl ? (
                <img
                  src={reading.coverUrl}
                  alt=""
                  className="size-12 shrink-0 rounded-lg object-cover shadow-cover"
                />
              ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-mist-100 font-display text-ink-400">
                  {reading.title.slice(0, 1)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-900">
                  {reading.title}
                </p>
                <p className="truncate text-sm text-ink-500">{reading.author}</p>
                {reading.originCountry ? (
                  <p className="text-xs text-ink-400">
                    {countryName(reading.originCountry)}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ListsView({ readings, shareLink, onSaveLink, onRevokeLink }) {
  const { queroComprar, jaTenho } = splitHaveAndWishlist(readings);
  const [copied, setCopied] = useState("");
  const [includeWish, setIncludeWish] = useState(true);
  const [includeOwned, setIncludeOwned] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!shareLink) {
      return;
    }
    setIncludeWish(shareLink.includeQueroComprar);
    setIncludeOwned(shareLink.includeOwned);
  }, [shareLink]);

  const copySection = async (items, title) => {
    const text = formatListCopy(items);
    if (!text) {
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(title);
    window.setTimeout(() => setCopied(""), 2500);
  };

  const publicUrl = shareLink
    ? shareUrl(window.location.origin, shareLink.token)
    : "";

  return (
    <div className="flex flex-col gap-6 print:gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="max-w-xl text-sm text-ink-500">
          Copie uma lista para o WhatsApp ou gere um link. Quem recebe vê só o
          que você escolher — sem resenha e sem notas.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full border border-mist-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-mist-100"
        >
          <Printer className="size-4" />
          Imprimir
        </button>
      </div>

      <ListSection
        title="Quero comprar"
        readings={queroComprar}
        onCopy={copySection}
        copied={copied}
      />
      <ListSection
        title="Já tenho"
        readings={jaTenho}
        onCopy={copySection}
        copied={copied}
      />

      {usesSupabase ? (
        <section className="rounded-3xl border border-mist-200 bg-white p-5 print:hidden">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Link de lista
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            O mesmo endereço continua válido se você mudar o que entra. Revogar
            encerra o acesso.
          </p>

          <fieldset className="mt-4 flex flex-col gap-2">
            <legend className="sr-only">Listas no link</legend>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
              <input
                type="checkbox"
                checked={includeWish}
                onChange={(event) => setIncludeWish(event.target.checked)}
              />
              Quero comprar
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
              <input
                type="checkbox"
                checked={includeOwned}
                onChange={(event) => setIncludeOwned(event.target.checked)}
              />
              Já tenho
            </label>
          </fieldset>

          {message ? (
            <p className="mt-3 text-sm text-ink-500" role="status">
              {message}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || (!includeWish && !includeOwned)}
              onClick={async () => {
                setBusy(true);
                setMessage("");
                try {
                  const saved = await onSaveLink({
                    includeQueroComprar: includeWish,
                    includeOwned,
                  });
                  const url = shareUrl(window.location.origin, saved.token);
                  await navigator.clipboard.writeText(url);
                  setCopied("link");
                  setMessage("Link atualizado e copiado.");
                  window.setTimeout(() => setCopied(""), 2500);
                } catch (error) {
                  setMessage(error.message);
                } finally {
                  setBusy(false);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-mist-700 px-4 py-2 text-sm font-semibold text-white hover:bg-mist-600 disabled:opacity-50"
            >
              <Link className="size-4" />
              {shareLink ? "Salvar listas do link" : "Criar link"}
            </button>
            {shareLink ? (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(publicUrl);
                    setCopied("link");
                    window.setTimeout(() => setCopied(""), 2500);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-mist-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-mist-100"
                >
                  <Copy className="size-4" />
                  {copied === "link" ? "Link copiado" : "Copiar link"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setMessage("");
                    try {
                      await onRevokeLink();
                      setMessage("Link revogado.");
                    } catch (error) {
                      setMessage(error.message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-berry-500/30 px-4 py-2 text-sm font-semibold text-berry-600 hover:bg-berry-500/8"
                >
                  <LinkOff className="size-4" />
                  Revogar
                </button>
              </>
            ) : null}
          </div>

          {publicUrl ? (
            <p className="mt-3 truncate text-xs text-ink-400">{publicUrl}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

export default ListsView;
