import type { AuthPort } from '../../ports';

export class LogoutUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(): Promise<void> {
    return this.authPort.logout();
  }
}