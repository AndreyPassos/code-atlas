import type { ProviderType } from '../../domain/value-objects';

export const PROVIDER_DISPLAY: Record<ProviderType, { name: string; icon: string }> = {
  github: { name: 'GitHub', icon: '🐙' },
  gitlab: { name: 'GitLab', icon: '🦊' },
};
