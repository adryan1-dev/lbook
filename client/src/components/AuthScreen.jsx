import { useId, useState } from "react";
import { useAuth } from "../lib/auth";
import PasswordField from "./PasswordField";

const fieldClassName =
  "w-full rounded-xl border border-mist-200 bg-mist-50 px-3 py-2.5 text-ink-900 transition duration-150 ease-out placeholder:text-ink-400 focus:border-mist-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-mist-400/35";

function AuthScreen() {
  const titleId = useId();
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState("signIn");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signIn") {
        await signIn(identifier.trim(), password);
      } else if (mode === "signUp") {
        await signUp(email.trim(), username, password, passwordConfirm);
        setMessage("Conta criada! Você já pode usar sua estante.");
        setMode("signIn");
        setIdentifier(email.trim());
        setPassword("");
        setPasswordConfirm("");
      } else {
        await resetPassword(email.trim());
        setMessage(
          "Se existir uma conta com esse email, enviamos um link para redefinir a senha.",
        );
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  };

  const titles = {
    signIn: "Entrar na estante",
    signUp: "Criar conta",
    reset: "Esqueci a senha",
  };

  const subtitles = {
    signIn: "Suas leituras ficam salvas na nuvem — acesse de qualquer lugar.",
    signUp: "Cadastre-se para catalogar suas leituras com sua própria estante.",
    reset: "Informe seu email e enviamos um link para redefinir a senha.",
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-mist-200 bg-white p-6 shadow-panel sm:p-8">
        <p className="font-display text-xs font-semibold tracking-[0.22em] text-blush-600 uppercase">
          Lbook
        </p>
        <h1 id={titleId} className="mt-2 font-display text-2xl font-semibold text-ink-900">
          {titles[mode]}
        </h1>
        <p className="mt-2 text-sm text-ink-500">{subtitles[mode]}</p>

        <form
          onSubmit={handleSubmit}
          aria-labelledby={titleId}
          className="mt-6 flex flex-col gap-4"
        >
          {mode === "signIn" ? (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink-700">
                Email ou nome de usuário
              </span>
              <input
                type="text"
                name="identifier"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
                autoComplete="username"
                className={fieldClassName}
              />
            </label>
          ) : (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink-700">Email</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className={fieldClassName}
              />
            </label>
          )}

          {mode === "signUp" ? (
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
              <span className="text-xs text-ink-500">
                3–20 caracteres: letras, números e underline. Precisa ser único.
              </span>
            </label>
          ) : null}

          {mode !== "reset" ? (
            <PasswordField
              label="Senha"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              className={fieldClassName}
            />
          ) : null}

          {mode === "signUp" ? (
            <PasswordField
              label="Confirmar senha"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              autoComplete="new-password"
              className={fieldClassName}
            />
          ) : null}

          {error ? (
            <p role="alert" className="rounded-xl bg-berry-500/10 px-4 py-3 text-sm text-berry-600">
              {error}
            </p>
          ) : null}

          {message ? (
            <p role="status" className="rounded-xl bg-blush-100 px-4 py-3 text-sm text-ink-700">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-full bg-mist-700 px-5 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-mist-600 active:scale-97 disabled:opacity-60"
          >
            {busy
              ? "Aguarde…"
              : mode === "signIn"
                ? "Entrar"
                : mode === "signUp"
                  ? "Criar conta"
                  : "Enviar link"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm text-ink-500">
          {mode === "signIn" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode("signUp");
                  setError("");
                  setMessage("");
                }}
                className="font-semibold text-mist-700 hover:text-mist-600"
              >
                Ainda não tem conta? Criar conta
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("reset");
                  setError("");
                  setMessage("");
                }}
                className="text-ink-500 hover:text-ink-700"
              >
                Esqueci a senha
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("signIn");
                setError("");
                setMessage("");
              }}
              className="font-semibold text-mist-700 hover:text-mist-600"
            >
              Voltar para entrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
