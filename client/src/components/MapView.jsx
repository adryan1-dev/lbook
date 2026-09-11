import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  LngLatBounds,
  Map,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorker from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import {
  clusterReadingsByCountry,
  firstWithoutCountry,
  readingsWithoutCountry,
} from "../lib/mapClusters";
import { countByStatus, filterByStatus } from "../lib/readings";
import PinPeek from "./PinPeek";
import StatusTabs from "./StatusTabs";
import { Close } from "./icons";

// MapLibre 6 looks for ./maplibre-gl-worker.mjs next to the chunk. Vite never
// emits that file, so production hits the SPA rewrite and the worker gets HTML.
setWorkerUrl(maplibreWorker);

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

function useCompact() {
  const [compact, setCompact] = useState(() =>
    window.matchMedia("(max-width: 639px)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const onChange = () => setCompact(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return compact;
}

function MapView({
  readings,
  flyToCountry,
  onFlyHandled,
  onOpenReading,
  onAddCountry,
}) {
  const compact = useCompact();
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const popupRef = useRef(null);
  const popupNode = useRef(document.createElement("div"));
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCode, setSelectedCode] = useState(null);
  const [peekIndex, setPeekIndex] = useState(0);

  const visibleReadings = useMemo(
    () => filterByStatus(readings, statusFilter),
    [readings, statusFilter],
  );
  const clusters = useMemo(
    () => clusterReadingsByCountry(readings, statusFilter),
    [readings, statusFilter],
  );
  const missingCount = readingsWithoutCountry(visibleReadings).length;
  const emptyTarget = firstWithoutCountry(visibleReadings);
  const selected = clusters.find((cluster) => cluster.code === selectedCode);
  const statusCounts = countByStatus(
    readings.filter((reading) => reading.originCountry),
  );

  useEffect(() => {
    const node = mapNode.current;
    if (!node) {
      return undefined;
    }

    let map;
    try {
      map = new Map({
        container: node,
        style: MAP_STYLE,
        center: [10, 20],
        zoom: 1.4,
        attributionControl: true,
      });
    } catch (error) {
      setMapError(error.message || "Não foi possível abrir o mapa.");
      return undefined;
    }

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    const onLoad = () => {
      map.resize();
      setMapReady(true);
      setMapError("");
    };
    const onError = (event) => {
      if (map.loaded()) {
        return;
      }
      const message = event?.error?.message || "O mapa não carregou as tiles.";
      setMapError(message);
    };

    map.on("load", onLoad);
    map.on("error", onError);

    const observer = new ResizeObserver(() => map.resize());
    observer.observe(node);

    return () => {
      observer.disconnect();
      map.off("load", onLoad);
      map.off("error", onError);
      markersRef.current.forEach((marker) => marker.remove());
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = clusters.map((cluster) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lbook-map-pin";
      button.setAttribute(
        "aria-label",
        cluster.readings.length > 1
          ? `${cluster.name}, ${cluster.readings.length} leituras`
          : `${cluster.name}, ${cluster.readings[0].title}`,
      );
      if (cluster.readings.length > 1) {
        const badge = document.createElement("span");
        badge.textContent = String(cluster.readings.length);
        button.append(badge);
      }
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        setSelectedCode(cluster.code);
        setPeekIndex(0);
      });

      return new Marker({ element: button, anchor: "bottom" })
        .setLngLat([cluster.lng, cluster.lat])
        .addTo(map);
    });
  }, [clusters, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    if (clusters.length === 0) {
      map.easeTo({ center: [10, 20], zoom: 1.4 });
      return;
    }

    if (clusters.length === 1) {
      map.easeTo({
        center: [clusters[0].lng, clusters[0].lat],
        zoom: 3.4,
        padding: 48,
      });
      return;
    }

    const bounds = new LngLatBounds();
    for (const cluster of clusters) {
      bounds.extend([cluster.lng, cluster.lat]);
    }
    map.fitBounds(bounds, { padding: 72, maxZoom: 4.2, duration: 600 });
  }, [clusters, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !flyToCountry) {
      return;
    }
    const cluster = clusters.find((item) => item.code === flyToCountry);
    if (cluster) {
      map.flyTo({
        center: [cluster.lng, cluster.lat],
        zoom: 4,
        essential: true,
      });
      setSelectedCode(cluster.code);
      setPeekIndex(0);
    }
    onFlyHandled?.();
  }, [clusters, flyToCountry, mapReady, onFlyHandled]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    if (!selected || compact) {
      popupRef.current?.remove();
      return;
    }

    if (!popupRef.current) {
      popupRef.current = new Popup({
        offset: 28,
        closeButton: false,
        closeOnClick: false,
        maxWidth: "300px",
        className: "lbook-map-popup",
      });
    }

    popupRef.current
      .setLngLat([selected.lng, selected.lat])
      .setDOMContent(popupNode.current)
      .addTo(map);
  }, [compact, mapReady, selected]);

  const countryList = (
    <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto sm:max-h-none">
      {clusters.map((cluster) => {
        const active = cluster.code === selectedCode;
        return (
          <li key={cluster.code}>
            <button
              type="button"
              onClick={() => {
                setSelectedCode(cluster.code);
                setPeekIndex(0);
                mapRef.current?.flyTo({
                  center: [cluster.lng, cluster.lat],
                  zoom: 4,
                  essential: true,
                });
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition duration-150 ease-out ${
                active
                  ? "bg-mist-700 text-white"
                  : "text-ink-700 hover:bg-mist-100"
              }`}
            >
              <span>{cluster.name}</span>
              <span className={`tabular-nums ${active ? "text-white/80" : "text-ink-500"}`}>
                {cluster.readings.length}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex flex-col gap-4">
      <StatusTabs
        active={statusFilter}
        counts={statusCounts}
        onChange={(value) => {
          setStatusFilter(value);
          setSelectedCode(null);
        }}
      />

      {visibleReadings.length > 0 && missingCount > 0 ? (
        <p className="text-sm text-ink-500">
          {missingCount === 1
            ? "1 leitura ainda sem país de origem."
            : `${missingCount} leituras ainda sem país de origem.`}
        </p>
      ) : null}

      {mapError ? (
        <p role="alert" className="text-sm text-berry-600">
          {mapError}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="relative overflow-hidden rounded-3xl border border-mist-200 bg-mist-100">
          <div
            ref={mapNode}
            className="lbook-map h-[70dvh] max-h-[640px] min-h-[320px] w-full"
          />
          {clusters.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
              <div className="pointer-events-auto max-w-sm rounded-3xl border border-mist-200 bg-white/95 px-5 py-4 text-center shadow-panel">
                <p className="font-display text-base font-semibold text-ink-900">
                  Sem pins ainda
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  Informe o país de origem nas leituras para marcar o mapa.
                </p>
                {emptyTarget ? (
                  <button
                    type="button"
                    onClick={() => onAddCountry(emptyTarget)}
                    className="mt-3 rounded-full bg-mist-700 px-4 py-2 text-sm font-semibold text-white hover:bg-mist-600"
                  >
                    Completar “{emptyTarget.title}”
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        {clusters.length > 0 ? (
          <aside className="rounded-3xl border border-mist-200 bg-white p-3">
            <p className="px-2 py-1 text-xs font-semibold tracking-[0.16em] text-ink-500 uppercase">
              Países
            </p>
            {countryList}
          </aside>
        ) : null}
      </div>

      {selected && !compact
        ? createPortal(
            <PinPeek
              cluster={selected}
              index={peekIndex}
              onIndexChange={setPeekIndex}
              onOpenReading={onOpenReading}
            />,
            popupNode.current,
          )
        : null}

      {selected && compact ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist-200 bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-panel">
          <div className="mx-auto flex max-w-lg items-start gap-2">
            <PinPeek
              cluster={selected}
              index={peekIndex}
              onIndexChange={setPeekIndex}
              onOpenReading={onOpenReading}
            />
            <button
              type="button"
              onClick={() => setSelectedCode(null)}
              className="ml-auto flex size-10 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-mist-100"
            >
              <Close className="size-4" />
              <span className="sr-only">Fechar</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MapView;
