import type { AuthPort } from '../../ports';

export class CheckAuthStatusUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(): Promise<boolean> {
    return this.authPort.isAuthenticated();
  }
}