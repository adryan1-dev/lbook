import { useId, useState } from "react";
import { useAuth } from "../lib/auth";

const fieldClassName =
  "w-full rounded-xl border border-mist-200 bg-mist-50 px-3 py-2.5 text-ink-900 transition duration-150 ease-out placeholder:text-ink-400 focus:border-mist-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-mist-400/35";

function ChooseUsernameScreen() {
  const titleId = useId();
  const { claimUsername, signOut } = useAuth();
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await claimUsername(username);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-mist-200 bg-white p-6 shadow-panel sm:p-8">
        <p className="font-display text-xs font-semibold tracking-[0.22em] text-blush-600 uppercase">
          Lbook
        </p>
        <h1 id={titleId} className="mt-2 font-display text-2xl font-semibold text-ink-900">
          Escolha um nome de usuário
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Ele aparece na sua estante e também serve para entrar, além do email.
        </p>
        <form
          onSubmit={handleSubmit}
          aria-labelledby={titleId}
          className="mt-6 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink-700">
              Nome de usuário
            </span>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={3}
              maxLength={20}
              autoComplete="username"
              spellCheck={false}
              className={fieldClassName}
            />
          </label>
          {error ? (
            <p role="alert" className="rounded-xl bg-berry-500/10 px-4 py-3 text-sm text-berry-600">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-mist-700 px-5 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-mist-600 active:scale-97 disabled:opacity-60"
          >
            {busy ? "Salvando…" : "Salvar e abrir a estante"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-4 w-full text-center text-sm font-semibold text-mist-700 hover:text-mist-600"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default ChooseUsernameScreen;
