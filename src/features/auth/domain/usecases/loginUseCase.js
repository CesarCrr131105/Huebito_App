export class LoginUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  call(credentials) {
    return this.repository.login(credentials);
  }
}