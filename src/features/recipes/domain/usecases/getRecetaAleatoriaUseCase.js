export class GetRecetaAleatoriaUseCase {
  constructor(repository) {
    this._repository = repository;
  }
  async call(categoria, { excluirId } = {}) {
    return this._repository.getAleatoria(categoria, { excluirId });
  }
}