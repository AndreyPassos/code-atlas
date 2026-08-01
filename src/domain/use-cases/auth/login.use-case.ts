import type { AuthPort } from '../../ports';
import type { User } from '../../entities';

export class LoginUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(): Promise<User> {
    return this.authPort.login();
  }
}