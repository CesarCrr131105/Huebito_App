import { appDatabase } from '../../../../core/database/appDatabase.js';
import { DbTables } from '../../../../core/database/dbConstants.js';

const AUTH_KEY = 'huebito_current_user';

export class AuthLocalDatasource {
  async obtenerUsuarioActual() {
    const id = localStorage.getItem(AUTH_KEY);
    if (!id) return null;
    return appDatabase.query(DbTables.usuarios, (usuario) => String(usuario.id) === id)[0] || null;
  }

  async login(correo, password) {
    return appDatabase.query(
      DbTables.usuarios,
      (usuario) => usuario.correo === correo && usuario.password === password,
    )[0] || null;
  }

  async registrar(usuario) {
    const id = appDatabase.insert(DbTables.usuarios, usuario);
    localStorage.setItem(AUTH_KEY, String(id));
    return appDatabase.query(DbTables.usuarios, (item) => item.id === id)[0];
  }

  async guardarUsuarioActual(usuario) {
    localStorage.setItem(AUTH_KEY, String(usuario.id));
  }

  async cerrarSesion() {
    localStorage.removeItem(AUTH_KEY);
  }
}