function Header({ count, onNewReading }) {
  return (
    <header className="sticky top-0 z-10 border-b border-mist-200 bg-mist-50/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-display text-xs font-semibold tracking-[0.22em] text-blush-600 uppercase">
            Lbook
          </p>
          <h1 className="flex items-baseline gap-2 font-display text-xl/tight font-semibold text-ink-900">
            Estante
            {count > 0 ? (
              <span className="text-sm font-medium tabular-nums text-ink-500">
                {count}
              </span>
            ) : null}
          </h1>
        </div>

        <button
          type="button"
          onClick={onNewReading}
          className="ml-auto shrink-0 rounded-full bg-mist-700 px-4 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-mist-600 active:scale-97"
        >
          Nova leitura
        </button>
      </div>
    </header>
  );
}

export default Header;
