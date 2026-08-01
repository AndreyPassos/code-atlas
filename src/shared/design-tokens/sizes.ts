export const sizes = {
  icon: {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },
  avatar: {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },
  button: {
    sm: 32,
    md: 44,
    lg: 56,
  },
  input: {
    sm: 32,
    md: 44,
    lg: 56,
  },
} as const;

export type SizeToken = typeof sizes;
