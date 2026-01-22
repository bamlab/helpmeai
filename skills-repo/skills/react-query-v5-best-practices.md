# React Query v5 Best Practices

This skill provides guidance for using TanStack Query v5 effectively.

## When to Use

Apply these patterns when working with `@tanstack/react-query` version 5.x.

## Key Concepts

### Query Keys

Always use query key factories for consistent and type-safe query keys:

```typescript
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

### useQuery

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
});
```

### useMutation with Optimistic Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    await queryClient.cancelQueries({ queryKey: userKeys.detail(newUser.id) });
    const previousUser = queryClient.getQueryData(userKeys.detail(newUser.id));
    queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
    return { previousUser };
  },
  onError: (err, newUser, context) => {
    queryClient.setQueryData(userKeys.detail(newUser.id), context?.previousUser);
  },
  onSettled: (data, error, variables) => {
    queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
  },
});
```

### useSuspenseQuery (v5 Feature)

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';

// Must be wrapped in Suspense boundary
const { data } = useSuspenseQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => fetchUser(userId),
});
// data is guaranteed to be defined here
```

## Common Patterns

### Dependent Queries

```typescript
const { data: user } = useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => fetchUser(userId),
});

const { data: projects } = useQuery({
  queryKey: ['projects', user?.id],
  queryFn: () => fetchProjects(user!.id),
  enabled: !!user?.id, // Only run when user is available
});
```

### Infinite Queries

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam }) => fetchPosts(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
});
```

## Things to Avoid

1. **Don't use inline query functions without memoization** in components that re-render frequently
2. **Don't forget to handle loading and error states** - always check `isLoading` and `error`
3. **Don't use `refetchOnWindowFocus: false` globally** - it defeats the purpose of stale-while-revalidate
4. **Don't forget `gcTime`** - the renamed `cacheTime` in v5

## Migration from v4

Key changes in v5:
- `cacheTime` renamed to `gcTime`
- `useQuery` callbacks (`onSuccess`, `onError`, `onSettled`) removed - use `useEffect` or mutation callbacks instead
- `isLoading` now only true on first load, use `isFetching` for refetch states
- New `useSuspenseQuery` hook for Suspense support
