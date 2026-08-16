import { BookPlus, LogOut } from "./icons";

function Header({ count, username, onSignOut, onNewReading }) {
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
          {username ? (
            <p className="mt-0.5 truncate text-xs text-ink-500">{username}</p>
          ) : null}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {onSignOut ? (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-mist-200 px-3 py-2 text-sm font-semibold text-ink-700 transition duration-150 ease-out hover:bg-mist-100"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          ) : null}
          <button
            type="button"
            onClick={onNewReading}
            className="inline-flex items-center gap-1.5 rounded-full bg-mist-700 px-4 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-mist-600 active:scale-97"
          >
            <BookPlus className="size-4" />
            Adicionar à estante
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
