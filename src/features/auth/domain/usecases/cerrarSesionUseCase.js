export class CerrarSesionUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  call() {
    return this.repository.cerrarSesion();
  }
}