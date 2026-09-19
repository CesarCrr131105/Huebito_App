export class GetRecetaPorIdUseCase {
  constructor(repository) {
    this._repository = repository;
  }
  async call(id) {
    return this._repository.getById(id);
  }
}