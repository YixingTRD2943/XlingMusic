export const rounded = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
} as const;

export type RoundedSize = keyof typeof rounded;
