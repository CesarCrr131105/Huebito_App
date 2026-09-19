export class RegistrarUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  call(data) {
    return this.repository.registrar(data);
  }
}