export class GetRecetasPorCategoriaUseCase {
  constructor(repository) {
    this._repository = repository;
  }
  async call(categoria) {
    return this._repository.getByCategoria(categoria);
  }
}