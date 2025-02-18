import type { APIUser } from "@humansignal/core/types/user";
import { API } from "apps/labelstudio/src/providers/ApiProvider";
import { useAtomValue } from "jotai";
import { atomWithQuery, queryClientAtom } from "jotai-tanstack-query";
import { useCallback } from "react";

const currentUserAtom = atomWithQuery(() => ({
  queryKey: ["current-user"],
  async queryFn() {
    return await API.invoke<APIUser>("me");
  },
}));

export function useCurrentUser() {
  const user = useAtomValue(currentUserAtom);
  const queryClient = useAtomValue(queryClientAtom);
  const refetch = useCallback(() => queryClient.invalidateQueries({ queryKey: ["current-user"] }), []);

  return user.isSuccess
    ? ({
        user: user.data,
        isInProgress: user.isFetching,
        loaded: user.isSuccess,
        error: null,
        fetch: refetch,
      } as const)
    : ({
        user: null,
        isInProgress: user.isFetching,
        loaded: user.isSuccess,
        error: user.error,
        fetch: refetch,
      } as const);
}
