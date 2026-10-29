function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  // NEXT_PUBLIC_ variable ko seedha process.env.NAME likhna zaroori hai,
  // warna Next.js use bundle mein replace nahi karta
  apiUrl: required('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
} as const;
