import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  assertPasswordsMatch,
  loginKind,
  parseUsername,
} from "./identity";
import { isSupabaseConfigured, supabase } from "./supabase";

const AuthContext = createContext(null);
const GENERIC_LOGIN_ERROR = "Email, nome de usuário ou senha incorretos.";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setUsername(null);
      return;
    }
    setProfileLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      setUsername(null);
    } else {
      setUsername(data?.username ?? null);
    }
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: current } }) => {
      if (!mounted) {
        return;
      }
      setSession(current);
      if (current?.user?.id) {
        setProfileLoading(true);
      }
      setLoading(false);
      loadProfile(current?.user?.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user?.id) {
        setProfileLoading(true);
      }
      setLoading(false);
      loadProfile(nextSession?.user?.id);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (identifier, password) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não configurado.");
    }
    const parsed = loginKind(identifier);
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }

    let email = parsed.value;
    if (parsed.kind === "username") {
      const { data, error } = await supabase.rpc("email_for_login", {
        identifier: parsed.value,
      });
      if (error || !data) {
        throw new Error(GENERIC_LOGIN_ERROR);
      }
      email = data;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(GENERIC_LOGIN_ERROR);
    }
  }, []);

  const signUp = useCallback(async (email, usernameInput, password, confirmation) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não configurado.");
    }
    const parsedName = parseUsername(usernameInput);
    if (!parsedName.ok) {
      throw new Error(parsedName.error);
    }
    const passwords = assertPasswordsMatch(password, confirmation);
    if (!passwords.ok) {
      throw new Error(passwords.error);
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username: parsedName.username } },
    });
    if (error) {
      throw new Error(translateAuthError(error.message));
    }
  }, []);

  const claimUsername = useCallback(async (usernameInput) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não configurado.");
    }
    const parsedName = parseUsername(usernameInput);
    if (!parsedName.ok) {
      throw new Error(parsedName.error);
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Sessão expirada. Entre de novo.");
    }
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username: parsedName.username,
    });
    if (error) {
      throw new Error(translateAuthError(error.message));
    }
    setUsername(parsedName.username);
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(translateAuthError(error.message));
    }
    setUsername(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não configurado.");
    }
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      throw new Error(translateAuthError(error.message));
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      username,
      loading: loading || (Boolean(session) && profileLoading && username === null),
      needsUsername: Boolean(session?.user) && !profileLoading && !username,
      signIn,
      signUp,
      claimUsername,
      signOut,
      resetPassword,
    }),
    [
      session,
      username,
      loading,
      profileLoading,
      signIn,
      signUp,
      claimUsername,
      signOut,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function translateAuthError(message) {
  if (message.includes("Invalid login credentials")) {
    return GENERIC_LOGIN_ERROR;
  }
  if (message.includes("User already registered")) {
    return "Este email já tem conta. Tente entrar.";
  }
  if (message.includes("duplicate") || message.includes("profiles_username")) {
    return "Este nome de usuário já está em uso.";
  }
  if (message.includes("Password should be at least")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  if (message.includes("Unable to validate email address")) {
    return "Email inválido.";
  }
  return message || "Não foi possível autenticar.";
}
