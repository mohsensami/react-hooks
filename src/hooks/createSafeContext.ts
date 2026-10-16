import { createContext, use } from 'react';

/**
 * Create a context whose consumer hook THROWS when used outside the provider
 * (no more `undefined` checks). Uses React 19's `use()` and `<Ctx value>` provider syntax.
 *
 * @example
 * export const [ThemeContext, useTheme] = createSafeContext<{ dark: boolean }>('Theme');
 * <ThemeContext value={{ dark: true }}><App /></ThemeContext>
 * const { dark } = useTheme();
 */
export function createSafeContext<T>(name: string) {
  const Context = createContext<T | null>(null);
  Context.displayName = name;

  function useSafeContext(): T {
    const value = use(Context);
    if (value === null) throw new Error(`use${name} must be used inside <${name}Context>`);
    return value;
  }

  return [Context, useSafeContext] as const;
}
