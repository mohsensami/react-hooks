import { useActionState } from 'react';
import { toError } from './utils';

/**
 * React 19 `useActionState` with built-in error handling.
 * Use `formAction` as the `<form action>`; `isPending` is true while it runs.
 * If your action throws, `error` is set and `data` keeps the previous value.
 *
 * @example
 * const { data, error, formAction, isPending } = useActionForm(
 *   async (prev, formData: FormData) => {
 *     await save(formData.get('name') as string);
 *     return { saved: true };
 *   },
 *   { saved: false },
 * );
 * <form action={formAction}><input name="name" /><button disabled={isPending}>Save</button></form>
 */
export function useActionForm<State, Payload = FormData>(
  action: (prev: State, payload: Payload) => State | Promise<State>,
  initialState: State,
  permalink?: string,
) {
  const [result, formAction, isPending] = useActionState<{ data: State; error: Error | null }, Payload>(
    async (prev, payload) => {
      try {
        return { data: await action(prev.data, payload), error: null };
      } catch (e) {
        return { data: prev.data, error: toError(e) };
      }
    },
    { data: initialState, error: null },
    permalink,
  );
  return { data: result.data, error: result.error, formAction, isPending };
}
