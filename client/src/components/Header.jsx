import { BookPlus, ClipboardList, LogOut, Map } from "./icons";

function NavLink({ href, current, onClick, children }) {
  return (
    <a
      href={href}
      aria-current={current ? "page" : undefined}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={`rounded-full px-3 py-2 text-sm font-semibold transition duration-150 ease-out ${
        current
          ? "bg-mist-700 text-white"
          : "text-ink-700 hover:bg-mist-100"
      }`}
    >
      {children}
    </a>
  );
}

function Header({
  count,
  username,
  view,
  onGoEstante,
  onGoMapa,
  onGoListas,
  onSignOut,
  onNewReading,
}) {
  const title =
    view === "mapa" ? "Mapa" : view === "listas" ? "Listas" : "Estante";

  return (
    <header className="sticky top-0 z-10 border-b border-mist-200 bg-mist-50/85 backdrop-blur-sm print:relative print:bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-display text-xs font-semibold tracking-[0.22em] text-blush-600 uppercase">
            Lbook
          </p>
          <h1 className="flex items-baseline gap-2 font-display text-xl/tight font-semibold text-ink-900">
            {title}
            {view === "estante" && count > 0 ? (
              <span className="text-sm font-medium tabular-nums text-ink-500">
                {count}
              </span>
            ) : null}
          </h1>
          {username ? (
            <p className="mt-0.5 truncate text-xs text-ink-500">{username}</p>
          ) : null}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <nav
            aria-label="Áreas da estante"
            className="hidden items-center gap-1 sm:flex print:hidden"
          >
            <NavLink href="/" current={view === "estante"} onClick={onGoEstante}>
              Estante
            </NavLink>
            <NavLink href="/mapa" current={view === "mapa"} onClick={onGoMapa}>
              Mapa
            </NavLink>
            <NavLink
              href="/listas"
              current={view === "listas"}
              onClick={onGoListas}
            >
              Listas
            </NavLink>
          </nav>

          {onSignOut ? (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-mist-200 px-3 py-2 text-sm font-semibold text-ink-700 transition duration-150 ease-out hover:bg-mist-100 print:hidden"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          ) : null}
          {view === "estante" ? (
            <button
              type="button"
              onClick={onNewReading}
              className="inline-flex items-center gap-1.5 rounded-full bg-mist-700 px-4 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-mist-600 active:scale-97 print:hidden"
            >
              <BookPlus className="size-4" />
              Adicionar à estante
            </button>
          ) : null}
        </div>
      </div>

      <nav
        aria-label="Áreas da estante"
        className="flex gap-1 overflow-x-auto px-4 pb-3 sm:hidden print:hidden"
      >
        <NavLink href="/" current={view === "estante"} onClick={onGoEstante}>
          Estante
        </NavLink>
        <NavLink href="/mapa" current={view === "mapa"} onClick={onGoMapa}>
          <span className="inline-flex items-center gap-1">
            <Map className="size-4" />
            Mapa
          </span>
        </NavLink>
        <NavLink href="/listas" current={view === "listas"} onClick={onGoListas}>
          <span className="inline-flex items-center gap-1">
            <ClipboardList className="size-4" />
            Listas
          </span>
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
