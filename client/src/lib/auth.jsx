import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: current } }) => {
      if (mounted) {
        setSession(current);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não configurado.");
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(translateAuthError(error.message));
    }
  }, []);

  const signUp = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não configurado.");
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw new Error(translateAuthError(error.message));
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(translateAuthError(error.message));
    }
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
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [session, loading, signIn, signUp, signOut, resetPassword],
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
    return "Email ou senha incorretos.";
  }
  if (message.includes("User already registered")) {
    return "Este email já tem conta. Tente entrar.";
  }
  if (message.includes("Password should be at least")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  if (message.includes("Unable to validate email address")) {
    return "Email inválido.";
  }
  return message || "Não foi possível autenticar.";
}
