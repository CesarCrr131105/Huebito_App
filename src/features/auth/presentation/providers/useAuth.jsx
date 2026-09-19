import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthLocalDatasource } from '../../data/datasources/authLocalDatasource.js';
import { AuthRepositoryImpl } from '../../data/repositories/authRepositoryImpl.js';
import { LoginUseCase } from '../../domain/usecases/loginUseCase.js';
import { RegistrarUseCase } from '../../domain/usecases/registrarUseCase.js';
import { CerrarSesionUseCase } from '../../domain/usecases/cerrarSesionUseCase.js';

const datasource = new AuthLocalDatasource();
const repository = new AuthRepositoryImpl(datasource);
const loginUC = new LoginUseCase(repository);
const registrarUC = new RegistrarUseCase(repository);
const cerrarSesionUC = new CerrarSesionUseCase(repository);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [modoInvitado, setModoInvitado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    repository.obtenerUsuarioActual()
      .then((u) => setUsuario(u))
      .catch(() => setUsuario(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (correo, password) => {
    setLoading(true);
    setError(null);
    try {
      const u = await loginUC.call({ correo, password });
      setUsuario(u);
      return u;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const registrar = useCallback(async (nombre, correo, password) => {
    setLoading(true);
    setError(null);
    try {
      const u = await registrarUC.call({ nombre, correo, password });
      setUsuario(u);
      return u;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    await cerrarSesionUC.call();
    setUsuario(null);
    setModoInvitado(false);
  }, []);

  const continuarComoInvitado = useCallback(() => {
    setModoInvitado(true);
  }, []);

  const autenticado = usuario !== null || modoInvitado;

  return (
    <AuthContext.Provider value={{
      usuario, loading, error,
      login, registrar, cerrarSesion,
      continuarComoInvitado, modoInvitado, autenticado,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}