function Header({ count, localDemo = false, username, onSignOut, onNewReading }) {
  return (
    <header className="sticky top-0 z-10 border-b border-mist-300/90 bg-mist-50/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-end gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-[11px] font-semibold tracking-[0.18em] text-blush-600 uppercase">
            Lbook
          </p>
          <h1 className="font-display text-3xl/none font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Estante
            {count > 0 ? (
              <span className="ml-3 align-middle text-lg font-medium tabular-nums text-ink-500">
                {count}
              </span>
            ) : null}
          </h1>
          {localDemo ? (
            <p className="mt-1 text-xs text-ink-500 sm:hidden">
              Dados só neste navegador
            </p>
          ) : username ? (
            <p className="mt-1 truncate text-xs text-ink-500 sm:hidden">
              {username}
            </p>
          ) : null}
        </div>

        {localDemo ? (
          <p className="mb-0.5 hidden max-w-[8.5rem] border border-dashed border-mist-400 px-2 py-1.5 text-[11px] leading-snug text-ink-500 sm:block">
            Dados só neste navegador
          </p>
        ) : username ? (
          <p className="mb-0.5 hidden border border-mist-400 px-3 py-1.5 text-center sm:block">
            <span className="block text-[10px] font-semibold tracking-[0.16em] text-ink-500 uppercase">
              Estante de
            </span>
            <span className="font-display text-sm font-semibold text-ink-900">
              {username}
            </span>
          </p>
        ) : null}

        <div className="mb-0.5 flex shrink-0 items-center gap-2">
          {onSignOut ? (
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-full border border-mist-300 px-3 py-2 text-sm font-semibold text-ink-700 transition duration-150 ease-out hover:bg-mist-100"
            >
              Sair
            </button>
          ) : null}
          <button
            type="button"
            onClick={onNewReading}
            className="rounded-full bg-mist-700 px-4 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-mist-600 active:scale-97"
          >
            Adicionar à estante
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
