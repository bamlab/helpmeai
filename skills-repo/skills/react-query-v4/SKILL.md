# React Query v4 Patterns

This skill provides guidance for using TanStack Query v4 effectively.

## When to Use

Apply these patterns when working with `@tanstack/react-query` version 4.x.

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

const { data, isLoading, isError, error } = useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  onSuccess: (data) => {
    console.log('Data fetched:', data);
  },
  onError: (error) => {
    console.error('Error fetching:', error);
  },
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

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
});
```

### Prefetching

```typescript
const queryClient = useQueryClient();

// Prefetch on hover
const handleHover = () => {
  queryClient.prefetchQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUser(userId),
  });
};
```

## Query Callbacks (v4 specific)

In v4, you can use callbacks directly in useQuery:

```typescript
const { data } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
  onSuccess: (data) => {
    // Handle successful fetch
    toast.success('User loaded');
  },
  onError: (error) => {
    // Handle error
    toast.error(error.message);
  },
  onSettled: (data, error) => {
    // Called on both success and error
    setLoading(false);
  },
});
```

## Migration to v5

When upgrading to v5, note these changes:
- `cacheTime` → `gcTime`
- `onSuccess`, `onError`, `onSettled` callbacks removed from `useQuery`
- `isLoading` behavior changed (only true on first load)
- New `useSuspenseQuery` hook available

## Things to Avoid

1. **Don't use inline query functions** in components that re-render frequently
2. **Don't forget to handle loading and error states**
3. **Don't use `refetchOnWindowFocus: false` globally** without good reason
4. **Don't forget cache invalidation** after mutations
5. **Don't use query callbacks for UI state** - prefer local state or effects
