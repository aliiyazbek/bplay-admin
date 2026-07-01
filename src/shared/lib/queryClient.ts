import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toAppError } from './errors';
import { toast } from '@ui/Toast';

/**
 * Global query client. Defaults are canonical (see /playadmin 09-conventions):
 * staleTime 30s, retry 1, no refetch-on-focus. Any query/mutation error that
 * isn't handled locally surfaces as a toast.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => toast.error(toAppError(error).message),
  }),
  mutationCache: new MutationCache({
    onError: (error) => toast.error(toAppError(error).message),
  }),
});
