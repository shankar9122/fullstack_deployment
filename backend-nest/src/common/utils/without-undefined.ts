// With some TypeScript settings an optional DTO field exists as an own property with the value
// undefined, so "no fields were sent" cannot be detected with Object.keys(dto).length.
// null is kept on purpose: it means "clear this value"
export function withoutUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
}