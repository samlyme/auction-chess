# TanStack Query Integration Plan

This document outlines the step-by-step implementation plan for integrating TanStack Query into the Auction Chess frontend.

## Architecture Decision

**Enhanced Service Layer Approach**: Keep the existing service layer and enhance it with TanStack Query hooks. This preserves the well-designed `Result<T>` error handling and type safety while adding caching benefits.

### Why this approach:

- ✅ Preserves existing excellent error handling patterns
- ✅ Maintains separation of concerns (services vs components)
- ✅ Gradual migration path with minimal disruption
- ✅ Keeps the `Result<T>` type that's used throughout the codebase
- ✅ Easy integration with existing real-time updates

## Phase 1: Foundation Setup

### Task 1: QueryClient Provider in App.tsx

**Current App.tsx structure:**

```typescript
// Current imports
import { RouterProvider, createRouter } from "@tanstack/react-router";
import AuthContextProvider from "./components/providers/AuthContextProvider";
```

**Add to imports:**

```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
```

**Wrap the existing providers:**

```typescript
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <AspectRatioWrapper>
          <InnerApp />
        </AspectRatioWrapper>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}
```

### Task 2: Create QueryClient Configuration

**Create new file: `src/lib/queryClient.ts`**

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Real-time data should always be fresh
      retry: (failureCount, error: any) => {
        // Don't retry authentication errors or 4xx client errors
        if (error?.status >= 400 && error?.status < 500) return false;
        // Retry network errors and 5xx server errors up to 3 times
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Don't refetch on window focus for real-time app
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});
```

## Phase 2: Query Hooks Implementation

### Task 3: Create useLobby Query Hooks

**Create new file: `src/hooks/queries/useLobby.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLobby,
  createLobby,
  joinLobby,
  startLobby,
  endLobby,
  deleteLobby,
  leaveLobby,
} from "../../services/lobbies";

// Query hook for getting current lobby
export function useLobby() {
  return useQuery({
    queryKey: ["lobby"],
    queryFn: () => getLobby(),
    select: (result) => (result.ok ? result.value : null),
    retry: false, // Lobby might not exist, don't retry
  });
}

// Mutation hook for creating a lobby
export function useCreateLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLobby,
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["lobby"] });
      }
    },
  });
}

// Mutation hook for joining a lobby
export function useJoinLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinLobby,
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["lobby"] });
      }
    },
  });
}

// Mutation hook for starting a lobby
export function useStartLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startLobby,
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["lobby"] });
        queryClient.invalidateQueries({ queryKey: ["game"] });
      }
    },
  });
}

// Mutation hook for ending a lobby
export function useEndLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: endLobby,
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["lobby"] });
        queryClient.invalidateQueries({ queryKey: ["game"] });
      }
    },
  });
}

// Mutation hook for deleting a lobby
export function useDeleteLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLobby,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lobby"] });
    },
  });
}

// Mutation hook for leaving a lobby
export function useLeaveLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveLobby,
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["lobby"] });
      }
    },
  });
}
```

### Task 4: Create useProfile Query Hooks

**Create new file: `src/hooks/queries/useProfile.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  createProfile,
  updateProfile,
} from "../../services/profiles";

// Query hook for getting a specific profile
export function useProfile(params?: { username?: string; id?: string }) {
  return useQuery({
    queryKey: ["profile", params],
    queryFn: () => getProfile(params || null),
    select: (result) => (result.ok ? result.value : null),
    enabled: !!params, // Only fetch if params provided
  });
}

// Query hook for getting current user's profile
export function useMyProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => getProfile(),
    select: (result) => (result.ok ? result.value : null),
  });
}

// Mutation hook for creating a profile
export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfile,
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
  });
}

// Mutation hook for updating a profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
  });
}
```

### Task 5: Create useGame Query Hooks

**Create new file: `src/hooks/queries/useGame.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeBid, makeMove, getGame, timecheck } from "../../services/game";
import type { Bid, NormalMove } from "shared";

// Query hook for getting current game state
export function useGame() {
  return useQuery({
    queryKey: ["game"],
    queryFn: () => getGame(),
    select: (result) => (result.ok ? result.value : null),
    staleTime: 0, // Game state changes frequently
  });
}

// Mutation hook for making a bid
export function useMakeBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bid: Bid) => makeBid(bid),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["game"] });
      }
    },
  });
}

// Mutation hook for making a move
export function useMakeMove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (move: NormalMove) => makeMove(move),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["game"] });
      }
    },
  });
}

// Mutation hook for timecheck
export function useTimecheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: timecheck,
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["game"] });
        queryClient.invalidateQueries({ queryKey: ["lobby"] });
      }
    },
  });
}
```

### Task 6: Create Query Hooks Index

**Create new file: `src/hooks/queries/index.ts`**

```typescript
// Lobby hooks
export {
  useLobby,
  useCreateLobby,
  useJoinLobby,
  useStartLobby,
  useEndLobby,
  useDeleteLobby,
  useLeaveLobby,
} from "./useLobby";

// Profile hooks
export {
  useProfile,
  useMyProfile,
  useCreateProfile,
  useUpdateProfile,
} from "./useProfile";

// Game hooks
export { useGame, useMakeBid, useMakeMove, useTimecheck } from "./useGame";
```

## Phase 3: Component Migration

### Task 7: Migrate LobbyPanel.tsx

**Current pattern:**

```typescript
const handleStartLobby = async () => {
  const result = await startLobby();
  if (!result.ok) {
    console.error("Failed to start lobby:", result.error);
  }
};
```

**New pattern:**

```typescript
import { useStartLobby } from '../../hooks/queries';

const startLobby = useStartLobby();

const handleStartLobby = () => {
  startLobby.mutate(undefined, {
    onError: (error) => {
      console.error('Failed to start lobby:', error);
    },
  });
};

// Add loading states to buttons
<button
  onClick={handleStartLobby}
  disabled={startLobby.isPending}
  className="w-full cursor-pointer rounded bg-green-400 px-4 py-3 text-xl hover:bg-green-300 disabled:opacity-50"
>
  {startLobby.isPending ? 'Starting...' : 'Start Game'}
</button>
```

### Task 8: Enhance lobbies.tsx Route

**Keep existing loader for initial data, add query hooks for real-time updates:**

```typescript
// In RouteComponent:
const {
  lobby: initLobby,
  game: initGame,
  oppProfile: initOppProfile,
} = Route.useLoaderData();

// Add query hooks for real-time updates
import { useLobby, useGame, useProfile } from "../../hooks/queries";
const { data: lobby } = useLobby();
const { data: game } = useGame();
const oppId = userId === lobby?.hostUid ? lobby?.guestUid : lobby?.hostUid;
const { data: oppProfile } = useProfile({ id: oppId });

// Use real-time data if available, fallback to loader data
const currentLobby = lobby || initLobby;
const currentGame = game || initGame;
const currentOppProfile = oppProfile || initOppProfile;
```

## Phase 4: Real-time Integration

### Task 9: Update useRealtime.ts

**Add QueryClient integration for cache invalidation:**

```typescript
import { useQueryClient } from "@tanstack/react-query";

export default function useRealtime(
  userId: string,
  lobbyCode: string,
  setLobby: (lobby: LobbyPayload | null) => void,
  setGameState: (gameState: AuctionChessState | null) => void,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime")
      .on("broadcast", { event: "lobby-update" }, (payload) => {
        // Update existing state setters
        setLobby(payload.lobby);

        // Invalidate queries for cache update
        queryClient.invalidateQueries({ queryKey: ["lobby"] });
      })
      .on("broadcast", { event: "game-update" }, (payload) => {
        // Update existing state setters
        setGameState(payload.gameState);

        // Invalidate queries for cache update
        queryClient.invalidateQueries({ queryKey: ["game"] });
      })
      .on("broadcast", { event: "lobby-delete" }, () => {
        // Handle lobby deletion
        setLobby(null);
        queryClient.invalidateQueries({ queryKey: ["lobby"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId, lobbyCode, setLobby, setGameState]);
}
```

## Phase 5: Additional Migrations

### Task 10: Profile Components Migration

Identify and migrate profile-related components to use the new query hooks:

- Profile creation form
- Profile settings/edit components
- Any components displaying profile information

## Phase 6: Testing & Optimization

### Task 11: Test Real-time Integration

Verify that:

- Real-time updates work correctly with query cache invalidation
- Loading states display properly
- Error handling works as expected
- Performance improvements are realized

### Task 12: Optional Service Layer Cleanup

If desired, consider:

- Removing `handleApiCall()` from `services/utils.ts`
- Refactoring service functions to return promises directly
- This is optional as the current service layer works well with TanStack Query

## Benefits Realization

### Immediate Benefits (Phase 1-2):

- ✅ **Deduplication**: Multiple components requesting same data use single API call
- ✅ **Background refetching**: Data stays fresh without manual refresh
- ✅ **Loading states**: Built-in `isLoading`, `isFetching` states
- ✅ **Error boundaries**: Better error handling and retry logic
- ✅ **Type safety preserved**: Existing service layer maintains `Result<T>` patterns

### Enhanced Benefits (Phase 3-4):

- ✅ **Optimistic updates**: Can add later for better UX
- ✅ **Real-time cache sync**: Supabase broadcasts invalidate relevant queries
- ✅ **Better user experience**: Loading states, error states, background updates
- ✅ **Performance gains**: Fewer unnecessary API calls, intelligent caching

## Implementation Timeline

- **Week 1**: Phase 1-2 (Foundation + Query Hooks)
- **Week 2**: Phase 3 (Component Migration)
- **Week 3**: Phase 4-5 (Enhancement + Polish)

## Risk Mitigation

1. **Gradual Migration**: Existing code continues working during transition
2. **Backward Compatibility**: Keep existing service layer untouched initially
3. **Testing Each Phase**: Validate functionality before proceeding
4. **Easy Rollback**: Can revert individual components if issues arise
