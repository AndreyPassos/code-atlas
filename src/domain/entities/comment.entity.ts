export interface Comment {
  readonly id: string;
  readonly body: string;
  readonly author: {
    readonly login: string;
    readonly avatarUrl: string;
  };
  readonly createdAt: Date;
}
