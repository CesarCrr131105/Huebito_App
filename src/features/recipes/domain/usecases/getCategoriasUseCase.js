export class GetCategoriasUseCase {
  constructor(repository) {
    this._repository = repository;
  }
  async call() {
    return this._repository.getCategorias();
  }
}