import { useEffect, useState } from "react";
import { fetchSharedLists } from "../lib/store";
import { readingsForShare } from "../lib/lists";
import { toReading } from "../lib/readings";
import { countryName } from "../lib/countries";

function ShareSection({ title, readings }) {
  if (readings.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-ink-900">
        {title}
        <span className="ml-2 text-sm font-medium tabular-nums text-ink-500">
          {readings.length}
        </span>
      </h2>
      <ul className="mt-4 divide-y divide-mist-100 rounded-3xl border border-mist-200 bg-white px-4">
        {readings.map((reading) => (
          <li key={reading.id} className="flex gap-3 py-3">
            {reading.coverUrl ? (
              <img
                src={reading.coverUrl}
                alt=""
                className="size-14 shrink-0 rounded-lg object-cover shadow-cover"
              />
            ) : (
              <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-mist-100 font-display text-ink-400">
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
    </section>
  );
}

function SharePage({ token }) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchSharedLists(token)
      .then((data) => {
        if (cancelled) {
          return;
        }
        if (!data) {
          setError("Este link não existe mais.");
          return;
        }
        setPayload(data);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message || "Este link não existe mais.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const readings = (payload?.readings ?? []).map((book) => toReading(book));
  const split = readingsForShare(readings, {
    includeQueroComprar: Boolean(payload?.include_quero_comprar),
    includeOwned: Boolean(payload?.include_owned),
  });

  return (
    <div className="min-h-dvh">
      <header className="border-b border-mist-200 bg-mist-50/85 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <p className="font-display text-xs font-semibold tracking-[0.22em] text-blush-600 uppercase">
            Lbook
          </p>
          <h1 className="font-display text-xl font-semibold text-ink-900">
            {payload?.username
              ? `Listas de ${payload.username}`
              : "Lista de leituras"}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {loading ? (
          <p className="text-sm text-ink-500">Abrindo a lista…</p>
        ) : error ? (
          <div className="rounded-3xl border border-mist-200 bg-white px-6 py-12 text-center">
            <p className="font-display text-lg font-semibold text-ink-900">
              Link indisponível
            </p>
            <p className="mt-2 text-sm text-ink-500">{error}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-500">
              Lista para presente. Sem notas e sem resenha.
            </p>
            {payload.include_quero_comprar ? (
              <ShareSection
                title="Quero comprar"
                readings={split.queroComprar}
              />
            ) : null}
            {payload.include_owned ? (
              <ShareSection title="Já tenho" readings={split.jaTenho} />
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

export default SharePage;
