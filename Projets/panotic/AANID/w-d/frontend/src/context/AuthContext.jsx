import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

// Déconnexion automatique après 30 minutes d'inactivité (app en arrière-plan)
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Enveloppe l'application et fournit l'état d'authentification global.
 * Restaure la session depuis AsyncStorage au démarrage.
 * Déconnecte automatiquement après 30 minutes d'inactivité en arrière-plan.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const backgroundTimeRef = useRef(null);

  useEffect(() => {
    authService
      .getStoredUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  // Déconnexion automatique si l'app reste en arrière-plan plus de INACTIVITY_TIMEOUT_MS
  useEffect(() => {
    if (!user) return;

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        backgroundTimeRef.current = Date.now();
      } else if (state === 'active' && backgroundTimeRef.current !== null) {
        if (Date.now() - backgroundTimeRef.current >= INACTIVITY_TIMEOUT_MS) {
          handleLogout();
        }
        backgroundTimeRef.current = null;
      }
    });

    return () => sub.remove();
  }, [user, handleLogout]);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
  }, []);

  const handleProfileUpdate = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        onLogin: handleLogin,
        onLogout: handleLogout,
        onProfileUpdate: handleProfileUpdate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte d'authentification.
 * Doit être utilisé à l'intérieur d'un AuthProvider.
 *
 * @returns {{
 *   user: object | null,
 *   loading: boolean,
 *   isAuthenticated: boolean,
 *   onLogin: (user: object) => void,
 *   onLogout: () => Promise<void>,
 *   onProfileUpdate: (user: object) => void,
 * }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  return ctx;
}
