import { useRef } from "react";
import { averageOf, labelOfStatus, statusAllowsRatings } from "../lib/readings";
import { ChevronLeft, ChevronRight, Star } from "./icons";

function PinPeek({ cluster, index, onIndexChange, onOpenReading }) {
  const touchX = useRef(null);
  const reading = cluster.readings[index];
  if (!reading) {
    return null;
  }

  const total = cluster.readings.length;
  const hasCarousel = total > 1;
  const next = hasCarousel
    ? cluster.readings[(index + 1) % total]
    : null;
  const average =
    statusAllowsRatings(reading.status) && averageOf(reading.ratings);

  const go = (delta) => {
    onIndexChange((index + delta + total) % total);
  };

  return (
    <div
      className="w-[272px] text-left"
      onTouchStart={(event) => {
        touchX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchX.current == null || !hasCarousel) {
          return;
        }
        const delta = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (delta > 40) {
          go(-1);
        } else if (delta < -40) {
          go(1);
        }
      }}
    >
      <p className="text-[11px] font-semibold tracking-[0.16em] text-blush-600 uppercase">
        {cluster.name}
      </p>

      <div className="relative mt-2">
        <button
          type="button"
          onClick={() => onOpenReading(reading)}
          className="flex w-full gap-3 rounded-2xl text-left transition duration-150 ease-out hover:bg-mist-50"
        >
          <span className="relative shrink-0">
            {reading.coverUrl ? (
              <img
                src={reading.coverUrl}
                alt=""
                className="size-20 rounded-xl object-cover shadow-cover"
              />
            ) : (
              <span className="flex size-20 items-center justify-center rounded-xl bg-mist-100 font-display text-lg text-ink-400">
                {reading.title.slice(0, 1)}
              </span>
            )}
            {next?.coverUrl ? (
              <img
                src={next.coverUrl}
                alt=""
                className="pointer-events-none absolute top-1 -right-2 size-14 rounded-lg object-cover opacity-70 shadow-cover"
              />
            ) : null}
            {average ? (
              <span className="absolute -bottom-1 -left-1 flex items-center gap-0.5 rounded-full bg-blush-100 px-1.5 py-0.5 font-display text-xs font-semibold tabular-nums text-ink-900 shadow-cover">
                {average}
                <Star filled className="size-3 text-sun-400" />
                <span className="sr-only">Média da leitura</span>
              </span>
            ) : null}
          </span>

          <span className="min-w-0 flex-1 py-0.5">
            <span className="block truncate font-display text-base font-semibold text-ink-900">
              {reading.title}
            </span>
            <span className="mt-0.5 block truncate text-sm text-ink-500">
              {reading.author}
            </span>
            <span className="mt-1 block text-xs font-semibold text-ink-500">
              {labelOfStatus(reading.status)}
            </span>
          </span>
        </button>
      </div>

      {hasCarousel ? (
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex size-9 items-center justify-center rounded-full text-ink-700 hover:bg-mist-100"
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Leitura anterior</span>
          </button>
          <p className="text-xs tabular-nums text-ink-500">
            {index + 1}/{total}
          </p>
          <button
            type="button"
            onClick={() => go(1)}
            className="flex size-9 items-center justify-center rounded-full text-ink-700 hover:bg-mist-100"
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Próxima leitura</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default PinPeek;
