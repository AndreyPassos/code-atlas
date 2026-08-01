export interface Owner {
  readonly login: string;
  readonly avatarUrl: string;
  readonly type: 'User' | 'Organization';
}
