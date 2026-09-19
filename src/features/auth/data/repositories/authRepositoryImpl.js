export class AuthRepositoryImpl {
  constructor(datasource) {
    this.datasource = datasource;
  }

  obtenerUsuarioActual() {
    return this.datasource.obtenerUsuarioActual();
  }

  async login({ correo, password }) {
    const usuario = await this.datasource.login(correo, password);
    if (!usuario) throw new Error('Correo o contraseña incorrectos');
    await this.datasource.guardarUsuarioActual(usuario);
    return usuario;
  }

  async registrar({ nombre, correo, password }) {
    const existente = await this.datasource.login(correo, password);
    if (existente?.correo === correo) throw new Error('El correo ya está registrado');
    return this.datasource.registrar({ nombre, correo, password });
  }

  cerrarSesion() {
    return this.datasource.cerrarSesion();
  }
}